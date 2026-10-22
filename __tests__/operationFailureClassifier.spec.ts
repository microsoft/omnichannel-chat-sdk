import { classifyOperationFailure } from "../src/utils/operationFailureClassifier";

describe("classifyOperationFailure", () => {
    const context = {
        operation: "SendMessage",
        failureStage: "SendMessage",
        errorCode: "MESSAGE_SEND_FAILED"
    };

    afterEach(() => {
        delete (globalThis as { navigator?: unknown }).navigator;
    });

    it("classifies browser offline failures without serializing the raw error", () => {
        Object.defineProperty(globalThis, "navigator", {
            configurable: true,
            value: { onLine: false }
        });
        const failure = classifyOperationFailure({
            message: "token=secret",
            response: {
                data: { content: "private message" },
                headers: { authorization: "Bearer secret" }
            }
        }, context);

        expect(failure.exceptionDetails).toEqual(expect.objectContaining({
            cancellationReason: "offline",
            online: false,
            isRetryable: true
        }));
        expect(JSON.stringify(failure)).not.toContain("secret");
        expect(JSON.stringify(failure)).not.toContain("private message");
        expect(JSON.stringify(failure)).not.toContain("authorization");
    });

    it("classifies cancellation as non-retryable", () => {
        const failure = classifyOperationFailure({ name: "AbortError" }, context);

        expect(failure.exceptionDetails.cancellationReason).toBe("cancelled");
        expect(failure.exceptionDetails.isRetryable).toBe(false);
    });

    it.each([
        [401, false],
        [429, true],
        [503, true]
    ])("classifies HTTP %s retryability", (httpStatus, isRetryable) => {
        const failure = classifyOperationFailure({
            response: {
                status: httpStatus,
                headers: {
                    "Retry-After": "2"
                }
            }
        }, context);

        expect(failure.exceptionDetails).toEqual(expect.objectContaining({
            httpStatus,
            isRetryable,
            retryAfterMs: 2000
        }));
    });
});
