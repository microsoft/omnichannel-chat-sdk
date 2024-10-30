/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @jest-environment jsdom
 */

import {createACSAdapter, createDirectLine, createIC3Adapter} from "../../src/utils/chatAdapterCreators";

import LiveChatVersion from "../../src/core/LiveChatVersion";
import WebUtils from "../../src/utils/WebUtils";

describe("Chat Adapter Creators", () => {
    it ("createDirectLine() should throw an exception if script load fails", async () => {
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

        WebUtils.loadScript = () => {throw Error()}

        try {
            await createDirectLine(optionalParams, chatSDKConfig, LiveChatVersion.V2, "DirectLine", telemetry, scenarioMarker);
        } catch (e: any ) {
            expect(e.message).toBe('ScriptLoadFailure');
        }
    });

    it ("createDirectLine() should throw an exception if object failed to be created", async () => {
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

        (WebUtils as any).loadScript = () => {Promise.resolve()};

        try {
            await createDirectLine(optionalParams, chatSDKConfig, LiveChatVersion.V2, "DirectLine", telemetry, scenarioMarker);
        } catch (e: any ) {
            expect(e.message).toBe('ChatAdapterInitializationFailure');
        }
    });

    it ("createACSAdapter() should throw an exception if script load fails", async () => {
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

        WebUtils.loadScript = () => {throw Error()}

        try {
            await createACSAdapter(optionalParams, chatSDKConfig, LiveChatVersion.V2, "ACS", telemetry, scenarioMarker, omnichannelConfig, chatToken, fileManager, chatClient, logger);
        } catch (e: any ) {
            expect(e.message).toBe('ScriptLoadFailure');
        }
    });

    it ("createACSAdapter() should throw an exception if object failed to be created", async () => {
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

        (WebUtils as any).loadScript = () => {Promise.resolve()};

        try {
            await createACSAdapter(optionalParams, chatSDKConfig, LiveChatVersion.V2, "ACS", telemetry, scenarioMarker, omnichannelConfig, chatToken, fileManager, chatClient, logger);
        } catch (e: any ) {
            expect(e.message).toBe('ChatAdapterInitializationFailure');
        }
    });

    it ("createIC3Adapter() should throw an exception if script load fails", async () => {
        const optionalParams = {
            IC3Adapter: {
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

        const chatToken = {};
        const ic3Client: any = jest.fn();
        const logger: any = jest.fn();

        WebUtils.loadScript = () => {throw Error()}

        try {
            await createIC3Adapter(optionalParams, chatSDKConfig, LiveChatVersion.V2, "ACS", telemetry, scenarioMarker, chatToken, ic3Client, logger);
        } catch (e: any ) {
            expect(e.message).toBe('ScriptLoadFailure');
        }
    });

    it ("createIC3Adapter() should throw an exception if object failed to be created", async () => {
        const optionalParams = {
            IC3Adapter: {
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

        const chatToken = {};
        const ic3Client: any = jest.fn();
        const logger: any = jest.fn();

        (WebUtils as any).loadScript = () => {Promise.resolve()};

        try {
            await createIC3Adapter(optionalParams, chatSDKConfig, LiveChatVersion.V2, "ACS", telemetry, scenarioMarker, chatToken, ic3Client, logger);
        } catch (e: any ) {
            expect(e.message).toBe('ChatAdapterInitializationFailure');
        }
    });
});