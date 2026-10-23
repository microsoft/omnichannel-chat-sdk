const getOnlineState = (): boolean | undefined => {
    return typeof navigator !== "undefined" && "onLine" in navigator ? navigator.onLine : undefined;
};

const getHttpStatus = (error: unknown): number | undefined => {
    const candidate = error as {
        httpResponseStatusCode?: unknown;
        status?: unknown;
        statusCode?: unknown;
        response?: { status?: unknown };
    };
    const status = candidate?.httpResponseStatusCode
        ?? candidate?.response?.status
        ?? candidate?.status
        ?? candidate?.statusCode;

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

const getFailureReason = (
    error: unknown,
    online: boolean | undefined,
    httpStatus: number | undefined
): string | undefined => {
    if (online === false) {
        return "Offline";
    }

    const candidate = error as { name?: unknown; code?: unknown; message?: unknown };
    const name = typeof candidate?.name === "string" ? candidate.name.toLowerCase() : "";
    const code = typeof candidate?.code === "string" ? candidate.code.toUpperCase() : "";
    const message = typeof candidate?.message === "string" ? candidate.message.toLowerCase() : "";

    if (name === "aborterror" || name === "cancelederror"
        || code === "ABORT_ERR" || code === "ERR_CANCELED" || code === "ECANCELED") {
        return "Cancelled";
    }

    if (code === "ECONNABORTED" || code === "ETIMEDOUT" || message.includes("timeout")) {
        return "Timeout";
    }

    if (httpStatus === undefined
        && (message.includes("network") || message.includes("failed to fetch") || message.includes("load failed"))) {
        return "NetworkError";
    }

    return undefined;
};

export const classifyEndChatFailure = (
    error: unknown,
    failureStage: string
): Record<string, string> => {
    const telemetryProperties: Record<string, string> = {
        Operation: "EndChat",
        FailureStage: failureStage,
        ErrorCode: "END_CHAT_FAILED",
        IsRetryable: "false"
    };

    try {
        const online = getOnlineState();
        const httpStatus = getHttpStatus(error);
        const retryAfterMs = getRetryAfterMs(error);
        const failureReason = getFailureReason(error, online, httpStatus);
        const isRetryable = httpStatus === 408
            || httpStatus === 429
            || (httpStatus !== undefined && httpStatus >= 500)
            || ["Offline", "Timeout", "NetworkError"].includes(failureReason ?? "");

        telemetryProperties.IsRetryable = String(isRetryable);
        if (failureReason) {
            telemetryProperties.FailureReason = failureReason;
        }
        if (online !== undefined) {
            telemetryProperties.Online = String(online);
        }
        if (httpStatus !== undefined) {
            telemetryProperties.HttpStatus = String(httpStatus);
        }
        if (retryAfterMs !== undefined) {
            telemetryProperties.RetryAfterMs = String(retryAfterMs);
        }
    } catch {
        return telemetryProperties;
    }

    return telemetryProperties;
};
