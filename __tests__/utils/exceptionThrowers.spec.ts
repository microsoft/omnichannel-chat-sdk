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
        }

        try {
            exceptionThrowers.throwChatSDKError(chatSDKError, e, scenarioMarker, telemetryEvent);
        } catch (e) {
            expect(e.message).toBe(chatSDKError);
            expect(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails).toBe(JSON.stringify(expectedExceptionDetails));
        }
    });
});