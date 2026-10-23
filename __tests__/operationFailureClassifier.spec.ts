import { classifyOperationFailure } from "../src/utils/operationFailureClassifier";

describe("classifyOperationFailure", () => {
    const context = {
        operation: "UploadFileAttachment",
        failureStage: "UploadDocument",
        errorCode: "FILE_UPLOAD_FAILED"
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
            message: "secret-file.txt failed at https://example.test/upload?token=secret",
            response: {
                data: { content: "private file content" },
                headers: { authorization: "secret" }
            }
        }, context);

        expect(failure.exceptionDetails).toEqual(expect.objectContaining({
            cancellationReason: "offline",
            online: false,
            isRetryable: true
        }));
        const serializedFailure = JSON.stringify(failure);
        expect(serializedFailure).not.toContain("secret-file.txt");
        expect(serializedFailure).not.toContain("private file content");
        expect(serializedFailure).not.toContain("example.test");
        expect(serializedFailure).not.toContain("authorization");
    });

    it("classifies explicit cancellation as non-retryable", () => {
        const failure = classifyOperationFailure({ name: "AbortError" }, context);

        expect(failure.exceptionDetails.cancellationReason).toBe("cancelled");
        expect(failure.exceptionDetails.isRetryable).toBe(false);
    });

    it("prefers explicit cancellation over the ambient offline state", () => {
        Object.defineProperty(globalThis, "navigator", {
            configurable: true,
            value: { onLine: false }
        });
        const failure = classifyOperationFailure({ name: "AbortError" }, context);

        expect(failure.exceptionDetails).toEqual(expect.objectContaining({
            cancellationReason: "cancelled",
            online: false,
            isRetryable: false
        }));
    });

    it("prefers a definitive HTTP response over a stale offline signal", () => {
        Object.defineProperty(globalThis, "navigator", {
            configurable: true,
            value: { onLine: false }
        });
        const failure = classifyOperationFailure({
            response: { status: 401 }
        }, context);

        expect(failure.exceptionDetails).toEqual(expect.objectContaining({
            httpStatus: 401,
            online: false,
            isRetryable: false
        }));
        expect(failure.exceptionDetails.cancellationReason).toBeUndefined();
    });

    it.each([
        [401, false],
        [408, true],
        [429, true],
        [501, false],
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
