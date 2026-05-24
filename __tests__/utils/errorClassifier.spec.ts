/* eslint-disable @typescript-eslint/no-explicit-any */

import { classifyNetworkError, CancellationReason } from "../../src/utils/errorClassifier";

describe('errorClassifier', () => {
    describe('classifyNetworkError', () => {

        // Test 1: Timeout detection
        it('should classify ECONNABORTED as timeout', () => {
            const error = { code: 'ECONNABORTED' };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('timeout');
        });

        // Test 2: Request cancellation detection
        it('should classify ERR_CANCELED as request_cancelled', () => {
            const error = { code: 'ERR_CANCELED' };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('request_cancelled');
        });

        it('should classify ECONNRESET as request_cancelled', () => {
            const error = { code: 'ECONNRESET' };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('request_cancelled');
        });

        // Test 3: Browser offline detection
        it('should classify as browser_offline when online=false', () => {
            const error = { message: 'Network Error' };
            const result = classifyNetworkError(error, false);
            expect(result).toBe('browser_offline');
        });

        it('should not classify as browser_offline when online=true', () => {
            const error = { message: 'Network Error' };
            const result = classifyNetworkError(error, true);
            // Should fall through to other classification
            expect(result).not.toBe('browser_offline');
        });

        // Test 4: DNS lookup failure detection
        it('should classify ENOTFOUND as dns_lookup_failed', () => {
            const error = { code: 'ENOTFOUND' };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('dns_lookup_failed');
        });

        it('should classify getaddrinfo message as dns_lookup_failed', () => {
            const error = { message: 'getaddrinfo ENOTFOUND api.example.com' };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('dns_lookup_failed');
        });

        // Test 5: Connection timeout detection
        it('should classify ETIMEDOUT as connection_timeout', () => {
            const error = { code: 'ETIMEDOUT' };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('connection_timeout');
        });

        // Test 6: Connection refused detection
        it('should classify ECONNREFUSED as connection_refused', () => {
            const error = { code: 'ECONNREFUSED' };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('connection_refused');
        });

        // Test 7: Network error with no response detection
        it('should classify HTTP status 0 with "Network Error" as network_error_no_response', () => {
            const error = {
                message: 'Network Error',
                response: { status: 0 }
            };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('network_error_no_response');
        });

        it('should not classify HTTP status 0 without "Network Error" message', () => {
            const error = {
                message: 'Something else',
                response: { status: 0 }
            };
            const result = classifyNetworkError(error, true);
            expect(result).not.toBe('network_error_no_response');
        });

        // Test 8: Server errors (5xx) - category only
        it('should classify HTTP 500 as server_error', () => {
            const error = { response: { status: 500 } };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('server_error');
        });

        it('should classify HTTP 502 as server_error', () => {
            const error = { response: { status: 502 } };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('server_error');
        });

        it('should classify HTTP 503 as server_error', () => {
            const error = { response: { status: 503 } };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('server_error');
        });

        it('should classify HTTP 504 as server_error', () => {
            const error = { response: { status: 504 } };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('server_error');
        });

        it('should classify HTTP 599 as server_error', () => {
            const error = { response: { status: 599 } };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('server_error');
        });

        // Test 9: Client errors (4xx) - category only
        it('should classify HTTP 400 as client_error', () => {
            const error = { response: { status: 400 } };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('client_error');
        });

        it('should classify HTTP 401 as client_error', () => {
            const error = { response: { status: 401 } };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('client_error');
        });

        it('should classify HTTP 404 as client_error', () => {
            const error = { response: { status: 404 } };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('client_error');
        });

        it('should classify HTTP 429 as client_error', () => {
            const error = { response: { status: 429 } };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('client_error');
        });

        it('should classify HTTP 499 as client_error', () => {
            const error = { response: { status: 499 } };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('client_error');
        });

        // Test 10: Unknown/unclassified errors
        it('should classify unknown error codes as unknown', () => {
            const error = { code: 'ESOMETHING_WEIRD' };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('unknown');
        });

        it('should classify empty error object as unknown', () => {
            const error = {};
            const result = classifyNetworkError(error, true);
            expect(result).toBe('unknown');
        });

        it('should classify null as unknown', () => {
            const result = classifyNetworkError(null, true);
            expect(result).toBe('unknown');
        });

        it('should classify undefined as unknown', () => {
            const result = classifyNetworkError(undefined, true);
            expect(result).toBe('unknown');
        });

        // Test 11: Priority ordering (earlier checks take precedence)
        it('should prioritize ECONNABORTED over browser offline', () => {
            const error = { code: 'ECONNABORTED' };
            // Even if browser is offline, timeout takes priority
            const result = classifyNetworkError(error, false);
            expect(result).toBe('timeout');
        });

        it('should prioritize ERR_CANCELED over HTTP status', () => {
            const error = {
                code: 'ERR_CANCELED',
                response: { status: 500 }
            };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('request_cancelled');
        });

        it('should prioritize DNS failure over HTTP status', () => {
            const error = {
                code: 'ENOTFOUND',
                response: { status: 0 }
            };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('dns_lookup_failed');
        });

        // Test 12: Edge cases
        it('should handle error with only message property', () => {
            const error = { message: 'Something went wrong' };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('unknown');
        });

        it('should handle error with nested response object', () => {
            const error = {
                response: {
                    status: 503,
                    statusText: 'Service Unavailable',
                    data: { error: 'overloaded' }
                }
            };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('server_error');
        });

        it('should handle online parameter being undefined', () => {
            const error = { code: 'ENOTFOUND' };
            const result = classifyNetworkError(error, undefined);
            expect(result).toBe('dns_lookup_failed');
        });

        // Test 13: Return type validation
        it('should return a valid CancellationReason type', () => {
            const validReasons: CancellationReason[] = [
                'timeout',
                'request_cancelled',
                'browser_offline',
                'dns_lookup_failed',
                'connection_timeout',
                'connection_refused',
                'network_error_no_response',
                'server_error',
                'client_error',
                'unknown'
            ];

            const error = { code: 'ECONNABORTED' };
            const result = classifyNetworkError(error, true);

            expect(validReasons).toContain(result);
        });

        // Test 14: Real-world axios error simulation
        it('should handle typical axios timeout error', () => {
            const error = {
                code: 'ECONNABORTED',
                message: 'timeout of 5000ms exceeded',
                config: {},
                request: {}
            };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('timeout');
        });

        it('should handle typical axios network error', () => {
            const error = {
                message: 'Network Error',
                config: {},
                request: {},
                response: { status: 0 }
            };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('network_error_no_response');
        });

        it('should handle typical axios 503 error', () => {
            const error = {
                message: 'Request failed with status code 503',
                config: {},
                request: {},
                response: {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: {},
                    data: {}
                }
            };
            const result = classifyNetworkError(error, true);
            expect(result).toBe('server_error');
        });
    });
});
