import AxiosErrorCodes from '../core/AxiosErrorCodes';

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

export function classifyNetworkError(error: unknown, online?: boolean): CancellationReason {
    if (error === null || error === undefined || typeof error !== 'object') {
        return 'unknown';
    }

    const err = error as { code?: string; message?: string; response?: { status?: number } | null };
    const errorCode = err.code;
    const errorMessage = err.message || '';
    const httpStatus = err.response?.status;

    if (errorCode === 'ECONNABORTED') {
        return 'timeout';
    }

    if (errorCode === 'ERR_CANCELED' || errorCode === 'ECONNRESET') {
        return 'request_cancelled';
    }

    if (online === false) {
        return 'browser_offline';
    }

    if (errorCode === AxiosErrorCodes.ERR_NETWORK && !err.response) {
        return 'network_error_no_response';
    }

    if (errorCode === 'ENOTFOUND' || errorMessage.includes('getaddrinfo')) {
        return 'dns_lookup_failed';
    }

    if (errorCode === 'ETIMEDOUT') {
        return 'connection_timeout';
    }

    if (errorCode === 'ECONNREFUSED') {
        return 'connection_refused';
    }

    if (httpStatus === 0 && errorMessage.includes('Network Error')) {
        return 'network_error_no_response';
    }

    if (httpStatus && httpStatus >= 500) {
        return 'server_error';
    }

    if (httpStatus && httpStatus >= 400) {
        return 'client_error';
    }

    return 'unknown';
}
