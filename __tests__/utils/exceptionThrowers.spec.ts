/* eslint-disable @typescript-eslint/no-explicit-any */

import exceptionThrowers from "../../src/utils/exceptionThrowers"

describe('exceptionThrowers', () => {
    it('throwChatSDKError() should throw exception properly', () => {
        const chatSDKError: any = "TestError";
        const e = new Error("test");
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";

        const expectedExceptionDetails = {
            response: chatSDKError,
            errorObject: `${e}`
        };

        try {
            exceptionThrowers.throwChatSDKError(chatSDKError, e, scenarioMarker, telemetryEvent);
        } catch (e : any) {
            expect(e.message).toBe(chatSDKError);
            expect(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails).toBe(JSON.stringify(expectedExceptionDetails));
        }
    });

    it('throwChatSDKError() without error object should be not part of the exception details', () => {
        const chatSDKError: any = "TestError";
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";

        const expectedExceptionDetails = {
            response: chatSDKError
        };

        try {
            exceptionThrowers.throwChatSDKError(chatSDKError, undefined, scenarioMarker, telemetryEvent);
        } catch (e : any) {
            expect(e.message).toBe(chatSDKError);
            expect(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails).toBe(JSON.stringify(expectedExceptionDetails));
        }
    });

    it('throwChatSDKError() with additional telemetry data should be passed to scenarioMarker.failScenario()', () => {
        const chatSDKError: any = "TestError";
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";
        const telemetryData = {
            chatId: 'chatId',
            requestId: 'requestId'
        };

        try {
            exceptionThrowers.throwChatSDKError(chatSDKError, undefined, scenarioMarker, telemetryEvent, telemetryData);
        } catch (e : any) {
            expect(e.message).toBe(chatSDKError);
            expect(scenarioMarker.failScenario.mock.calls[0][1].chatId).toBeDefined();
            expect(scenarioMarker.failScenario.mock.calls[0][1].requestId).toBeDefined();
            expect(scenarioMarker.failScenario.mock.calls[0][1].chatId).toBe(telemetryData.chatId);
            expect(scenarioMarker.failScenario.mock.calls[0][1].requestId).toBe(telemetryData.requestId);
        }
    });

    it('throwChatSDKError() with additional message should call console.error()', () => {
        const chatSDKError: any = "TestError";
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";
        const message = "message";

        jest.spyOn(console, 'error');

        try {
            exceptionThrowers.throwChatSDKError(chatSDKError, undefined, scenarioMarker, telemetryEvent, {}, message);
        } catch (e : any) {
            expect(e.message).toBe(chatSDKError);
            expect(console.error).toHaveBeenCalledWith(message);
        }
    });
});