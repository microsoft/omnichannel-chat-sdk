/**
 * Classifies network/HTTP errors into standardized cancellation reason categories.
 * Pure function with no side effects - suitable for unit testing.
 *
 * ADO 6373382: Diagnostic telemetry for ChatConfigRetrievalFailure
 */

/**
 * Standardized cancellation reason categories for network errors
 */
export type CancellationReason =
    | 'timeout'
    | 'request_cancelled'
    | 'browser_offline'
    | 'dns_lookup_failed'
    | 'connection_timeout'
    | 'connection_refused'
    | 'network_error_no_response'
    | 'server_error'
    | 'client_error'
    | 'unknown';

/**
 * Classifies an error object into a standardized cancellation reason category.
 *
 * @param error The error object to classify (typically from axios or fetch)
 * @param online Browser's online status (navigator.onLine) - optional
 * @returns A standardized cancellation reason string
 *
 * @example
 * ```typescript
 * const error = { code: 'ECONNABORTED' };
 * const reason = classifyNetworkError(error, true);
 * // Returns: 'timeout'
 * ```
 */
export function classifyNetworkError(error: unknown, online?: boolean): CancellationReason {
    // Handle null/undefined errors
    if (error === null || error === undefined || typeof error !== 'object') {
        return 'unknown';
    }

    // Type guard for error objects with common properties
    const err = error as { code?: string; message?: string; response?: { status?: number } };
    const errorCode = err.code;
    const errorMessage = err.message || '';
    const httpStatus = err.response?.status;

    // Priority order for classification:

    // 1. Explicit timeout (ECONNABORTED from axios)
    if (errorCode === 'ECONNABORTED') {
        return 'timeout';
    }

    // 2. Request cancelled by client
    if (errorCode === 'ERR_CANCELED' || errorCode === 'ECONNRESET') {
        return 'request_cancelled';
    }

    // 3. Browser offline (navigator.onLine === false)
    if (online === false) {
        return 'browser_offline';
    }

    // 4. DNS lookup failure
    if (errorCode === 'ENOTFOUND' || errorMessage.includes('getaddrinfo')) {
        return 'dns_lookup_failed';
    }

    // 5. Connection timeout (different from request timeout)
    if (errorCode === 'ETIMEDOUT') {
        return 'connection_timeout';
    }

    // 6. Connection refused
    if (errorCode === 'ECONNREFUSED') {
        return 'connection_refused';
    }

    // 7. Network error with no response (HTTP status 0)
    if (httpStatus === 0 && errorMessage.includes('Network Error')) {
        return 'network_error_no_response';
    }

    // 8. Server error (5xx) - category only, no specific status
    if (httpStatus && httpStatus >= 500) {
        return 'server_error';
    }

    // 9. Client error (4xx) - category only, no specific status
    if (httpStatus && httpStatus >= 400) {
        return 'client_error';
    }

    // 10. Unknown/unclassified error
    return 'unknown';
}
