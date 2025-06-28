/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @jest-environment jsdom
 */

import { createACSAdapter, createDirectLine } from "../../src/utils/chatAdapterCreators";

import { ACSAdapterLogger } from "../../src/utils/loggers";
import LiveChatVersion from "../../src/core/LiveChatVersion";
import WebUtils from "../../src/utils/WebUtils";

describe("Chat Adapter Creators", () => {

    beforeEach(() => {
        jest.resetModules();
    }
    );

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("createDirectLine() should throw an exception if script load fails", async () => {
        const optionalParams = {
            DirectLine: {
                options: {}
            }
        };

        const chatSDKConfig = {};
        const telemetry: any = {
            setCDNPackages: jest.fn()
        };

        const scenarioMarker: any = {
            startScenario: jest.fn(),
            failScenario: jest.fn()
        };

        WebUtils.loadScript = () => { throw Error() }

        try {
            await createDirectLine(optionalParams, chatSDKConfig, LiveChatVersion.V2, "DirectLine", telemetry, scenarioMarker);
        } catch (e: any) {
            expect(e.message).toBe('ScriptLoadFailure');
        }
    });

    it("createDirectLine() should throw an exception if object failed to be created", async () => {
        const optionalParams = {
            DirectLine: {
                options: {}
            }
        };

        const chatSDKConfig = {};
        const telemetry: any = {
            setCDNPackages: jest.fn()
        };

        const scenarioMarker: any = {
            startScenario: jest.fn(),
            failScenario: jest.fn()
        };

        (WebUtils as any).loadScript = () => { Promise.resolve() };

        try {
            await createDirectLine(optionalParams, chatSDKConfig, LiveChatVersion.V2, "DirectLine", telemetry, scenarioMarker);
        } catch (e: any) {
            expect(e.message).toBe('ChatAdapterInitializationFailure');
        }
    });

    it("createACSAdapter should return an Adapter", async () => {
        jest.mock("@microsoft/botframework-webchat-adapter-azure-communication-chat");

        const optionalParams = {
            ACSAdapter: {
                options: {}
            }
        };

        const chatSDKConfig = {};
        const telemetry: any = {
            setCDNPackages: jest.fn()
        };

        const scenarioMarker: any = {
            startScenario: jest.fn(),
            failScenario: jest.fn(),
            completeScenario: jest.fn()
        };

        const omnichannelConfig = {
            orgId: '',
            orgUrl: '',
            widgetId: '',
        };

        const chatToken = {};
        const fileManager: any = jest.fn();
        const chatClient: any = jest.fn();

        const logger = new ACSAdapterLogger(omnichannelConfig);

        const adapter = await createACSAdapter(optionalParams, chatSDKConfig, LiveChatVersion.V2, "ACS", telemetry, scenarioMarker, omnichannelConfig, chatToken, fileManager, chatClient, logger) as any;
        expect(adapter).toBeDefined();
    });

    it("createACSAdapter() should throw an exception if object failed to be created", async () => {

        const optionalParams = {
            ACSAdapter: {
                options: {}
            }
        };

        const chatSDKConfig = {};
        const telemetry: any = {
            setCDNPackages: jest.fn()
        };

        const scenarioMarker: any = {
            startScenario: jest.fn(),
            failScenario: jest.fn()
        };

        const omnichannelConfig = {
            orgId: '',
            orgUrl: '',
            widgetId: '',
        };

        const chatToken = {};
        const fileManager: any = jest.fn();
        const chatClient: any = jest.fn();
        const logger: any = jest.fn();

        try {
            await createACSAdapter(optionalParams, chatSDKConfig, LiveChatVersion.V2, "ACS", telemetry, scenarioMarker, omnichannelConfig, chatToken, fileManager, chatClient, logger);
            fail("Failure expected");
        } catch (e: any) {
            expect(e.message).toBe('ChatAdapterInitializationFailure');
        }
    });
});