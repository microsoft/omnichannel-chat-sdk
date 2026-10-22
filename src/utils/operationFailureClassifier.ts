import ChatSDKExceptionDetails from "../core/ChatSDKExceptionDetails";

export interface OperationFailureContext {
    operation: string;
    failureStage: string;
    errorCode: string;
    response?: string;
    operationId?: string;
}

export interface OperationFailureClassification {
    exceptionDetails: ChatSDKExceptionDetails;
    telemetryProperties: Record<string, string | number | boolean>;
    httpStatus?: number;
}

const getOnlineState = (): boolean | undefined => {
    return typeof navigator !== "undefined" && "onLine" in navigator ? navigator.onLine : undefined;
};

const getHttpStatus = (error: unknown): number | undefined => {
    const candidate = error as {
        status?: unknown;
        statusCode?: unknown;
        response?: { status?: unknown };
    };
    const status = candidate?.response?.status ?? candidate?.status ?? candidate?.statusCode;
    if (typeof status === "number" && Number.isFinite(status)) {
        return status;
    }

    if (typeof status === "string" && /^\d{3}$/.test(status)) {
        return Number(status);
    }

    return undefined;
};

const getHeader = (error: unknown, headerName: string): unknown => {
    const headers = (error as {
        response?: {
            headers?: Record<string, unknown> | { get?: (name: string) => unknown };
        };
    })?.response?.headers;

    if (!headers) {
        return undefined;
    }

    if (typeof (headers as { get?: unknown }).get === "function") {
        return (headers as { get: (name: string) => unknown }).get(headerName);
    }

    const normalizedHeaderName = headerName.toLowerCase();
    const matchingHeader = Object.keys(headers).find((key) => key.toLowerCase() === normalizedHeaderName);
    return matchingHeader ? (headers as Record<string, unknown>)[matchingHeader] : undefined;
};

const parseNonNegativeNumber = (value: unknown): number | undefined => {
    if (typeof value === "number") {
        return Number.isFinite(value) && value >= 0 ? value : undefined;
    }

    if (typeof value !== "string" || value.trim() === "") {
        return undefined;
    }

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : undefined;
};

const getRetryAfterMs = (error: unknown): number | undefined => {
    const retryAfterMs = parseNonNegativeNumber(
        getHeader(error, "x-ms-retry-after-ms") ?? getHeader(error, "retry-after-ms")
    );
    if (retryAfterMs !== undefined) {
        return retryAfterMs;
    }

    const retryAfterSeconds = parseNonNegativeNumber(getHeader(error, "retry-after"));
    return retryAfterSeconds === undefined ? undefined : retryAfterSeconds * 1000;
};

const getCancellationReason = (
    error: unknown,
    online: boolean | undefined,
    httpStatus: number | undefined
): string | undefined => {
    if (online === false) {
        return "offline";
    }

    const candidate = error as { name?: unknown; code?: unknown; message?: unknown };
    const name = typeof candidate?.name === "string" ? candidate.name.toLowerCase() : "";
    const code = typeof candidate?.code === "string" ? candidate.code.toUpperCase() : "";
    const message = typeof candidate?.message === "string" ? candidate.message.toLowerCase() : "";

    if (name === "aborterror" || name === "cancelederror" ||
        code === "ABORT_ERR" || code === "ERR_CANCELED" || code === "ECANCELED") {
        return "cancelled";
    }

    if (code === "ECONNABORTED" || code === "ETIMEDOUT" || message.includes("timeout")) {
        return "timeout";
    }

    if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
        return "dns_lookup_failed";
    }

    if (code === "ECONNREFUSED") {
        return "connection_refused";
    }

    if (code === "ECONNRESET") {
        return "connection_reset";
    }

    if (httpStatus === undefined &&
        (message.includes("network") || message.includes("failed to fetch") || message.includes("load failed"))) {
        return "network_error_no_response";
    }

    return undefined;
};

const isRetryableFailure = (
    httpStatus: number | undefined,
    cancellationReason: string | undefined
): boolean => {
    if (httpStatus === 408 || httpStatus === 429 || (httpStatus !== undefined && httpStatus >= 500)) {
        return true;
    }

    return [
        "offline",
        "timeout",
        "dns_lookup_failed",
        "connection_refused",
        "connection_reset",
        "network_error_no_response"
    ].includes(cancellationReason ?? "");
};

export const classifyOperationFailure = (
    error: unknown,
    context: OperationFailureContext
): OperationFailureClassification => {
    const online = getOnlineState();
    const httpStatus = getHttpStatus(error);
    const retryAfterMs = getRetryAfterMs(error);
    const cancellationReason = getCancellationReason(error, online, httpStatus);
    const isRetryable = isRetryableFailure(httpStatus, cancellationReason);
    const exceptionDetails: ChatSDKExceptionDetails = {
        response: context.response ?? context.errorCode,
        operation: context.operation,
        failureStage: context.failureStage,
        operationId: context.operationId,
        errorCode: context.errorCode,
        cancellationReason,
        online,
        httpStatus,
        isRetryable,
        retryAfterMs
    };
    const telemetryProperties: Record<string, string | number | boolean> = {
        Operation: context.operation,
        FailureStage: context.failureStage,
        ErrorCode: context.errorCode,
        IsRetryable: isRetryable,
        ExceptionDetails: JSON.stringify(exceptionDetails)
    };

    if (context.operationId) {
        telemetryProperties.OperationId = context.operationId;
    }
    if (cancellationReason) {
        telemetryProperties.CancellationReason = cancellationReason;
    }
    if (online !== undefined) {
        telemetryProperties.Online = online;
    }
    if (httpStatus !== undefined) {
        telemetryProperties.HttpStatus = httpStatus;
    }
    if (retryAfterMs !== undefined) {
        telemetryProperties.RetryAfterMs = retryAfterMs;
    }

    return {
        exceptionDetails,
        telemetryProperties,
        httpStatus
    };
};
