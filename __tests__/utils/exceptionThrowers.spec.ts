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

    // ADO 6373382: Tests for diagnostic data (Tier 1 telemetry fields)
    it('throwChatSDKError() with diagnosticData should include all fields in exception details', () => {
        const chatSDKError: any = "TestError";
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";
        const diagnosticData = {
            clientElapsedMs: 1234,
            cancellationReason: 'timeout',
            online: false
        };

        const expectedExceptionDetails = {
            response: chatSDKError,
            clientElapsedMs: 1234,
            cancellationReason: 'timeout',
            online: false
        };

        try {
            exceptionThrowers.throwChatSDKError(chatSDKError, undefined, scenarioMarker, telemetryEvent, {}, undefined, diagnosticData);
        } catch (e : any) {
            expect(e.message).toBe(chatSDKError);
            expect(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails).toBe(JSON.stringify(expectedExceptionDetails));
        }
    });

    it('throwChatSDKError() with partial diagnosticData should include only provided fields', () => {
        const chatSDKError: any = "TestError";
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";
        const diagnosticData = {
            clientElapsedMs: 567,
            online: true
        };

        const expectedExceptionDetails = {
            response: chatSDKError,
            clientElapsedMs: 567,
            online: true
        };

        try {
            exceptionThrowers.throwChatSDKError(chatSDKError, undefined, scenarioMarker, telemetryEvent, {}, undefined, diagnosticData);
        } catch (e : any) {
            expect(e.message).toBe(chatSDKError);
            const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
            expect(actualExceptionDetails.response).toBe(expectedExceptionDetails.response);
            expect(actualExceptionDetails.clientElapsedMs).toBe(expectedExceptionDetails.clientElapsedMs);
            expect(actualExceptionDetails.online).toBe(expectedExceptionDetails.online);
            expect(actualExceptionDetails.cancellationReason).toBeUndefined();
        }
    });

    it('throwChatConfigRetrievalFailure() with diagnosticData should pass it through to throwChatSDKError', () => {
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";
        const diagnosticData = {
            clientElapsedMs: 890,
            online: false,
            cancellationReason: 'network_error'
        };

        try {
            exceptionThrowers.throwChatConfigRetrievalFailure(new Error('network'), scenarioMarker, telemetryEvent, diagnosticData);
        } catch (e : any) {
            const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
            expect(actualExceptionDetails.clientElapsedMs).toBe(890);
            expect(actualExceptionDetails.online).toBe(false);
            expect(actualExceptionDetails.cancellationReason).toBe('network_error');
        }
    });

    it('throwChatConfigRetrievalFailure() without diagnosticData should work (backward compatibility)', () => {
        const scenarioMarker: any = {
            failScenario: jest.fn()
        };
        const telemetryEvent: any = "TestEvent";

        try {
            exceptionThrowers.throwChatConfigRetrievalFailure(new Error('test'), scenarioMarker, telemetryEvent);
        } catch (e : any) {
            expect(e.message).toBe('ChatConfigRetrievalFailure');
            expect(scenarioMarker.failScenario).toHaveBeenCalled();
            // Should not crash, diagnostic fields just omitted
            const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
            expect(actualExceptionDetails.response).toBe('ChatConfigRetrievalFailure');
        }
    });

    it('throwChatSDKError() without diagnosticData should work (backward compatibility)', () => {
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

    // ADO 6373382: Comprehensive tests for enhanced cancellation reasons
    describe('Enhanced cancellation reason detection', () => {
        it('should detect timeout cancellation reason', () => {
            const scenarioMarker: any = { failScenario: jest.fn() };
            const telemetryEvent: any = "TestEvent";
            const diagnosticData = {
                clientElapsedMs: 5001,
                online: true,
                cancellationReason: 'timeout'
            };

            try {
                exceptionThrowers.throwChatConfigRetrievalFailure(new Error('timeout'), scenarioMarker, telemetryEvent, diagnosticData);
            } catch (e : any) {
                const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
                expect(actualExceptionDetails.cancellationReason).toBe('timeout');
            }
        });

        it('should detect request_cancelled cancellation reason', () => {
            const scenarioMarker: any = { failScenario: jest.fn() };
            const telemetryEvent: any = "TestEvent";
            const diagnosticData = {
                clientElapsedMs: 234,
                online: true,
                cancellationReason: 'request_cancelled'
            };

            try {
                exceptionThrowers.throwChatConfigRetrievalFailure(new Error('cancelled'), scenarioMarker, telemetryEvent, diagnosticData);
            } catch (e : any) {
                const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
                expect(actualExceptionDetails.cancellationReason).toBe('request_cancelled');
            }
        });

        it('should detect browser_offline cancellation reason', () => {
            const scenarioMarker: any = { failScenario: jest.fn() };
            const telemetryEvent: any = "TestEvent";
            const diagnosticData = {
                clientElapsedMs: 100,
                online: false,
                cancellationReason: 'browser_offline'
            };

            try {
                exceptionThrowers.throwChatConfigRetrievalFailure(new Error('offline'), scenarioMarker, telemetryEvent, diagnosticData);
            } catch (e : any) {
                const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
                expect(actualExceptionDetails.cancellationReason).toBe('browser_offline');
                expect(actualExceptionDetails.online).toBe(false);
            }
        });

        it('should detect dns_lookup_failed cancellation reason', () => {
            const scenarioMarker: any = { failScenario: jest.fn() };
            const telemetryEvent: any = "TestEvent";
            const diagnosticData = {
                clientElapsedMs: 120,
                online: true,
                cancellationReason: 'dns_lookup_failed'
            };

            try {
                exceptionThrowers.throwChatConfigRetrievalFailure(new Error('ENOTFOUND'), scenarioMarker, telemetryEvent, diagnosticData);
            } catch (e : any) {
                const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
                expect(actualExceptionDetails.cancellationReason).toBe('dns_lookup_failed');
            }
        });

        it('should detect connection_timeout cancellation reason', () => {
            const scenarioMarker: any = { failScenario: jest.fn() };
            const telemetryEvent: any = "TestEvent";
            const diagnosticData = {
                clientElapsedMs: 30000,
                online: true,
                cancellationReason: 'connection_timeout'
            };

            try {
                exceptionThrowers.throwChatConfigRetrievalFailure(new Error('ETIMEDOUT'), scenarioMarker, telemetryEvent, diagnosticData);
            } catch (e : any) {
                const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
                expect(actualExceptionDetails.cancellationReason).toBe('connection_timeout');
            }
        });

        it('should detect connection_refused cancellation reason', () => {
            const scenarioMarker: any = { failScenario: jest.fn() };
            const telemetryEvent: any = "TestEvent";
            const diagnosticData = {
                clientElapsedMs: 50,
                online: true,
                cancellationReason: 'connection_refused'
            };

            try {
                exceptionThrowers.throwChatConfigRetrievalFailure(new Error('ECONNREFUSED'), scenarioMarker, telemetryEvent, diagnosticData);
            } catch (e : any) {
                const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
                expect(actualExceptionDetails.cancellationReason).toBe('connection_refused');
            }
        });

        it('should detect network_error_no_response cancellation reason', () => {
            const scenarioMarker: any = { failScenario: jest.fn() };
            const telemetryEvent: any = "TestEvent";
            const diagnosticData = {
                clientElapsedMs: 300,
                online: true,
                cancellationReason: 'network_error_no_response'
            };

            try {
                exceptionThrowers.throwChatConfigRetrievalFailure(new Error('Network Error'), scenarioMarker, telemetryEvent, diagnosticData);
            } catch (e : any) {
                const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
                expect(actualExceptionDetails.cancellationReason).toBe('network_error_no_response');
            }
        });

        it('should detect server_error cancellation reason (5xx category)', () => {
            const scenarioMarker: any = { failScenario: jest.fn() };
            const telemetryEvent: any = "TestEvent";
            const diagnosticData = {
                clientElapsedMs: 1234,
                online: true,
                cancellationReason: 'server_error'
            };

            try {
                exceptionThrowers.throwChatConfigRetrievalFailure(new Error('Service Unavailable'), scenarioMarker, telemetryEvent, diagnosticData);
            } catch (e : any) {
                const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
                expect(actualExceptionDetails.cancellationReason).toBe('server_error');
            }
        });

        it('should detect client_error cancellation reason (4xx category)', () => {
            const scenarioMarker: any = { failScenario: jest.fn() };
            const telemetryEvent: any = "TestEvent";
            const diagnosticData = {
                clientElapsedMs: 456,
                online: true,
                cancellationReason: 'client_error'
            };

            try {
                exceptionThrowers.throwChatConfigRetrievalFailure(new Error('Not Found'), scenarioMarker, telemetryEvent, diagnosticData);
            } catch (e : any) {
                const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
                expect(actualExceptionDetails.cancellationReason).toBe('client_error');
            }
        });

        it('should detect unknown cancellation reason for unrecognized errors', () => {
            const scenarioMarker: any = { failScenario: jest.fn() };
            const telemetryEvent: any = "TestEvent";
            const diagnosticData = {
                clientElapsedMs: 123,
                online: true,
                cancellationReason: 'unknown'
            };

            try {
                exceptionThrowers.throwChatConfigRetrievalFailure(new Error('Strange error'), scenarioMarker, telemetryEvent, diagnosticData);
            } catch (e : any) {
                const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
                expect(actualExceptionDetails.cancellationReason).toBe('unknown');
            }
        });

        it('should include all diagnostic fields with cancellation reasons', () => {
            const scenarioMarker: any = { failScenario: jest.fn() };
            const telemetryEvent: any = "TestEvent";
            const diagnosticData = {
                clientElapsedMs: 5001,
                online: true,
                cancellationReason: 'timeout'
            };

            try {
                exceptionThrowers.throwChatConfigRetrievalFailure(new Error('timeout'), scenarioMarker, telemetryEvent, diagnosticData);
            } catch (e : any) {
                const actualExceptionDetails = JSON.parse(scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);
                expect(actualExceptionDetails.clientElapsedMs).toBe(5001);
                expect(actualExceptionDetails.online).toBe(true);
                expect(actualExceptionDetails.cancellationReason).toBe('timeout');
                expect(actualExceptionDetails.response).toBe('ChatConfigRetrievalFailure');
            }
        });
    });
});