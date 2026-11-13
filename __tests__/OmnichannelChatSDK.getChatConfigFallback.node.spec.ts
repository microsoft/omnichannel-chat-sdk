import axios, { AxiosError } from "axios";
import createAMSClient from "@microsoft/omnichannel-amsclient";
import { SDKProvider } from "@microsoft/ocsdk";
import OmnichannelChatSDK from "../src/OmnichannelChatSDK";
import ChatConfig from "../src/core/ChatConfig";
import { ChatSDKErrorName } from "../src/core/ChatSDKError";
import LiveChatVersion from "../src/core/LiveChatVersion";
import { AWTLogManager } from "../src/external/aria/webjs/AriaSDK";

jest.mock("@microsoft/omnichannel-amsclient", () => ({
    __esModule: true,
    default: jest.fn().mockResolvedValue({})
}));

const telemetryInitialization = jest.spyOn(AWTLogManager, "initialize").mockImplementation(jest.fn());
const realGetSDK = SDKProvider.getSDK.bind(SDKProvider);
// Keep real OCSDK requests, but leave its independent transport retry policy out of these host-fallback tests.
const sdkCreation = jest.spyOn(SDKProvider, "getSDK").mockImplementation((configuration, sdkConfiguration, logger) =>
    realGetSDK(configuration, { ...sdkConfiguration, maxRequestRetriesOnFailure: 0 }, logger));

const unqOrgUrl = "https://contoso-crm4.omnichannelengagementhub.com";
const coreServicesOrgUrl = "https://m-org-id.eu.omnichannelengagementhub.com";
const customUserAgents = ["customer-app/1.0", "customer-widget/2.0"];
const originalAdapter = axios.defaults.adapter;
let requests: Array<{ origin: string; userAgent: unknown }>;
let failureMode: "none" | "core" | "both";
let fetchedConfig: ChatConfig;

beforeEach(() => {
    requests = [];
    failureMode = "none";
    sdkCreation.mockClear();
    jest.mocked(createAMSClient).mockClear();
    fetchedConfig = {
        LiveChatVersion: LiveChatVersion.V2,
        LiveWSAndLiveChatEngJoin: {
            msdyn_widgetappid: "widget-id",
            msdyn_enablefileattachmentsforcustomers: "true"
        },
        DataMaskingInfo: { setting: { msdyn_maskforcustomer: false } },
        LiveChatConfigAuthSettings: {
            msdyn_authenticationtype: "192350000",
            msdyn_javascriptclientfunction: "getAuthToken",
            msdyn_publickeyurl: "https://example.test/public-key"
        },
        ChatWidgetLanguage: { msdyn_localeid: "1036" },
        allowedFileExtensions: ".png,.txt",
        maxUploadFileSize: "4096"
    };
    axios.defaults.adapter = async (config) => {
        if (!config.url) {
            throw new Error("Missing config request URL");
        }
        const url = new URL(config.url);
        if (url.pathname !== "/livechatconnector/config/org-id/widget-id" ||
            ![coreServicesOrgUrl, unqOrgUrl].includes(url.origin)) {
            throw new Error(`Unexpected config request: ${url.href}`);
        }
        requests.push({ origin: url.origin, userAgent: config.headers.get("Ms-Oc-User-Agent") });
        if (url.origin === coreServicesOrgUrl && failureMode !== "none") {
            throw new AxiosError("core-services config unavailable", AxiosError.ERR_NETWORK, config);
        }
        if (url.origin === unqOrgUrl && failureMode === "both") {
            throw new AxiosError("unq config unavailable", AxiosError.ERR_NETWORK, config);
        }
        return { data: fetchedConfig, status: 200, statusText: "OK", headers: {}, config };
    };
});

afterEach(() => {
    axios.defaults.adapter = originalAdapter;
});

afterAll(() => {
    sdkCreation.mockRestore();
    telemetryInitialization.mockRestore();
});

interface ConfigFixture {
    sdk: OmnichannelChatSDK;
    buildConfigurations: jest.MockedFunction<(configuration: ChatConfig) => Promise<void>>;
    evaluatedConfigurations: unknown[];
}

const makeSDK = (): ConfigFixture => {
    const sdk = new OmnichannelChatSDK(
        { orgUrl: unqOrgUrl, orgId: "org-id", widgetId: "widget-id" },
        { ocUserAgent: customUserAgents, getAuthToken: async () => "test-auth-token" }
    );
    const buildConfigurations = jest.fn(sdk["buildConfigurations"].bind(sdk));
    sdk["buildConfigurations"] = buildConfigurations;
    const evaluatedConfigurations: unknown[] = [];
    const realEvaluateAMSAvailability = sdk["evaluateAMSAvailability"].bind(sdk);
    sdk["evaluateAMSAvailability"] = jest.fn(() => {
        evaluatedConfigurations.push(sdk["liveChatConfig"]);
        return realEvaluateAMSAvailability();
    });
    return { sdk, buildConfigurations, evaluatedConfigurations };
};

const expectAppliedConfiguration = (instance: ConfigFixture, result: ChatConfig): void => {
    expect(result).toBe(fetchedConfig);
    expect(instance.sdk["liveChatConfig"]).toBe(fetchedConfig);
    expect(instance.buildConfigurations).toHaveBeenCalledTimes(1);
    expect(instance.buildConfigurations).toHaveBeenCalledWith(fetchedConfig);
    expect(instance.evaluatedConfigurations).toEqual([fetchedConfig]);
    expect(instance.sdk["authSettings"]).toBe(fetchedConfig.LiveChatConfigAuthSettings);
    expect(instance.sdk["authenticatedUserToken"]).toBe("test-auth-token");
    expect(instance.sdk["isAMSClientAllowed"]).toBe(true);
    expect(instance.sdk.localeId).toBe("1036");
    expect(instance.sdk.isInitialized).toBe(true);
};

describe.each([
    { name: "sequential", useParallelLoad: false },
    { name: "parallel", useParallelLoad: true }
])("$name initialization config fallback", ({ useParallelLoad }) => {
    it("applies the complete unq config after a core-services ERR_NETWORK", async () => {
        failureMode = "core";
        const instance = makeSDK();

        const result = await instance.sdk.initialize({ useParallelLoad });

        expect(requests.map((request) => request.origin)).toEqual([coreServicesOrgUrl, unqOrgUrl]);
        expectAppliedConfiguration(instance, result);
    });

    it("preserves caller and SDK user agents on the real fallback request", async () => {
        failureMode = "core";
        const { sdk } = makeSDK();

        await sdk.initialize({ useParallelLoad });

        expect(requests).toHaveLength(2);
        expect(requests[0].userAgent).toContain(customUserAgents[0]);
        expect(requests[0].userAgent).toContain(customUserAgents[1]);
        expect(requests[0].userAgent).toContain("omnichannel-chat-sdk/");
        expect(requests[0].userAgent).toContain("ocsdk/");
        expect(requests[1].userAgent).toBe(requests[0].userAgent);
        expect(customUserAgents).toEqual(["customer-app/1.0", "customer-widget/2.0"]);
    });

    it("preserves normal core-services success without an unq request", async () => {
        const instance = makeSDK();

        const result = await instance.sdk.initialize({ useParallelLoad });

        expect(requests.map((request) => request.origin)).toEqual([coreServicesOrgUrl]);
        expect(sdkCreation).toHaveBeenCalledTimes(1);
        expectAppliedConfiguration(instance, result);
    });

    it("reports fallback failure without applying a partial config or initializing", async () => {
        failureMode = "both";
        const { sdk, buildConfigurations, evaluatedConfigurations } = makeSDK();

        await expect(sdk.initialize({ useParallelLoad })).rejects.toMatchObject({
            message: ChatSDKErrorName.ChatConfigRetrievalFailure,
            exceptionDetails: { errorObject: expect.stringContaining("unq config unavailable") }
        });

        expect(requests.map((request) => request.origin)).toEqual([coreServicesOrgUrl, unqOrgUrl]);
        expect(sdk.isInitialized).toBe(false);
        expect(sdk["liveChatConfig"]).toEqual({});
        expect(sdk["authSettings"]).toBeNull();
        expect(sdk["isAMSClientAllowed"]).toBe(false);
        expect(buildConfigurations).not.toHaveBeenCalled();
        expect(evaluatedConfigurations).toHaveLength(0);
        expect(createAMSClient).not.toHaveBeenCalled();
    });
});
