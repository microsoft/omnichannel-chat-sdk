/* eslint-disable @typescript-eslint/no-explicit-any */

import {ACSAdapterLogger, ACSClientLogger, AMSClientLogger, CallingSDKLogger, IC3ClientLogger, OCSDKLogger} from '../../src/utils/loggers';

import LogLevel from '@microsoft/omnichannel-ic3core/lib/logging/LogLevel';

describe('loggers', () => {
    describe('IC3ClientLogger', () => {
        const omnichannelConfig = {
            orgId: '',
            orgUrl: '',
            widgetId: ''
        }

        const telemetry = {
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            info: jest.fn()
        }

        it('IC3ClientLogger.logClientSdkTelemetryEvent() with LogLevel DEBUG should call telemetry.debug()', () => {
            const logger = new IC3ClientLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logClientSdkTelemetryEvent(LogLevel.DEBUG, eventData as any);

            expect(telemetry.debug).toBeCalledTimes(1);
        });

        it('IC3ClientLogger.logClientSdkTelemetryEvent() with LogLevel WARN should call telemetry.warn()', () => {
            const logger = new IC3ClientLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logClientSdkTelemetryEvent(LogLevel.WARN, eventData as any);

            expect(telemetry.warn).toBeCalledTimes(1);
        });

        it('IC3ClientLogger.logClientSdkTelemetryEvent() with LogLevel ERROR should call telemetry.error()', () => {
            const logger = new IC3ClientLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logClientSdkTelemetryEvent(LogLevel.ERROR, eventData as any);

            expect(telemetry.error).toBeCalledTimes(1);
        });

        it('IC3ClientLogger.logClientSdkTelemetryEvent() with LogLevel INFO should call telemetry.info()', () => {
            const logger = new IC3ClientLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logClientSdkTelemetryEvent(LogLevel.INFO, eventData as any);

            expect(telemetry.info).toBeCalledTimes(1);
        });
    });

    describe('OCSDKLogger', () => {
        const omnichannelConfig = {
            orgId: '',
            orgUrl: '',
            widgetId: ''
        }

        const telemetry = {
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            info: jest.fn()
        }

        it('OCSDKLogger.logClientSdkTelemetryEvent() with LogLevel DEBUG should call telemetry.debug()', () => {
            const logger = new OCSDKLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logClientSdkTelemetryEvent(LogLevel.DEBUG, eventData as any);

            expect(telemetry.debug).toBeCalledTimes(1);
        });

        it('OCSDKLogger.logClientSdkTelemetryEvent() with LogLevel WARN should call telemetry.warn()', () => {
            const logger = new OCSDKLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logClientSdkTelemetryEvent(LogLevel.WARN, eventData as any);

            expect(telemetry.warn).toBeCalledTimes(1);
        });

        it('OCSDKLogger.logClientSdkTelemetryEvent() with LogLevel ERROR should call telemetry.error()', () => {
            const logger = new OCSDKLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logClientSdkTelemetryEvent(LogLevel.ERROR, eventData as any);

            expect(telemetry.error).toBeCalledTimes(1);
        });

        it('OCSDKLogger.logClientSdkTelemetryEvent() with LogLevel INFO should call telemetry.info()', () => {
            const logger = new OCSDKLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logClientSdkTelemetryEvent(LogLevel.INFO, eventData as any);

            expect(telemetry.info).toBeCalledTimes(1);
        });
    });

    describe('ACSClientLogger', () => {
        const omnichannelConfig = {
            orgId: '',
            orgUrl: '',
            widgetId: ''
        }

        const telemetry = {
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            info: jest.fn()
        }

        it('ACSClientLogger.logClientSdkTelemetryEvent() with LogLevel DEBUG should call telemetry.debug()', () => {
            const logger = new ACSClientLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logClientSdkTelemetryEvent(LogLevel.DEBUG, eventData as any);

            expect(telemetry.debug).toBeCalledTimes(1);
        });

        it('ACSClientLogger.logClientSdkTelemetryEvent() with LogLevel WARN should call telemetry.warn()', () => {
            const logger = new ACSClientLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logClientSdkTelemetryEvent(LogLevel.WARN, eventData as any);

            expect(telemetry.warn).toBeCalledTimes(1);
        });

        it('ACSClientLogger.logClientSdkTelemetryEvent() with LogLevel ERROR should call telemetry.error()', () => {
            const logger = new ACSClientLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logClientSdkTelemetryEvent(LogLevel.ERROR, eventData as any);

            expect(telemetry.error).toBeCalledTimes(1);
        });

        it('ACSClientLogger.logClientSdkTelemetryEvent() with LogLevel INFO should call telemetry.info()', () => {
            const logger = new ACSClientLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logClientSdkTelemetryEvent(LogLevel.INFO, eventData as any);

            expect(telemetry.info).toBeCalledTimes(1);
        });

        it('ACSClientLogger.startScenario() should call ScenarioMarker.startScenario()', () => {
            const logger = new ACSClientLogger(omnichannelConfig);

            (logger as any).scenarioMarker = {
                startScenario: jest.fn(),
            }

            logger.startScenario('');

            expect((logger as any).scenarioMarker.startScenario).toHaveBeenCalledTimes(1);
        });

        it('ACSClientLogger.failScenario() should call ScenarioMarker.failScenario()', () => {
            const logger = new ACSClientLogger(omnichannelConfig);

            (logger as any).scenarioMarker = {
                failScenario: jest.fn(),
            }

            logger.failScenario('');

            expect((logger as any).scenarioMarker.failScenario).toHaveBeenCalledTimes(1);
        });

        it('ACSClientLogger.completeScenario() should call ScenarioMarker.completeScenario()', () => {
            const logger = new ACSClientLogger(omnichannelConfig);

            (logger as any).scenarioMarker = {
                completeScenario: jest.fn(),
            }

            logger.completeScenario('');

            expect((logger as any).scenarioMarker.completeScenario).toHaveBeenCalledTimes(1);
        });
    });

    describe('ACSAdapterLogger', () => {
        const omnichannelConfig = {
            orgId: '',
            orgUrl: '',
            widgetId: ''
        }

        const telemetry = {
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            info: jest.fn()
        }

        it('ACSAdapterLogger.logEvent() with LogLevel DEBUG should call telemetry.debug()', () => {
            const logger = new ACSAdapterLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logEvent(LogLevel.DEBUG, eventData as any);

            expect(telemetry.debug).toBeCalledTimes(1);
        });

        it('ACSAdapterLogger.logEvent() with LogLevel WARN should call telemetry.warn()', () => {
            const logger = new ACSAdapterLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logEvent(LogLevel.WARN, eventData as any);

            expect(telemetry.warn).toBeCalledTimes(1);
        });

        it('ACSAdapterLogger.logEvent() with LogLevel ERROR should call telemetry.error()', () => {
            const logger = new ACSAdapterLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logEvent(LogLevel.ERROR, eventData as any);

            expect(telemetry.error).toBeCalledTimes(1);
        });

        it('ACSAdapterLogger.logEvent() with LogLevel INFO should call telemetry.info()', () => {
            const logger = new ACSAdapterLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logEvent(LogLevel.INFO, eventData as any);

            expect(telemetry.info).toBeCalledTimes(1);
        });


        it('ACSAdapterLogger.logEvent() with custom properties having PII data', () => {
            const logger = new ACSAdapterLogger(omnichannelConfig);
            telemetry.info.mockClear();
            const eventData = {
                Event: '',
                CustomProperties: {
                    "threadId": "19:123456@thread.v2",
                    "sender": {
                        "kind": "communicationUser",
                        "communicationUserId": "8:acs:12345678"
                    },
                    "senderDisplayName": "Test User",
                    "recipient": {
                        "kind": "communicationUser",
                        "communicationUserId": "8:acs:12345678"
                    },
                    "id": "1738036094447",
                    "createdOn": "2025-01-28T03:48:14.447Z",
                    "version": "1738036094447",
                    "type": "Text",
                    "message": "hi",
                    "metadata": {
                        "tags": "public",
                        "deliveryMode": "bridged",
                        "isBridged": "True"
                    },
                    "attachments": []
                },
                Description: {"message":"https://support.microsoft.com/files?workspace=asdasdfasdfasdfasdf","length":931,"senderDisplayName":"Test user","threadId":"19:123456@thread.v2","sender":{"kind":"communicationUser","communicationUserId":"8:acs:12345678"},"recipient":{"kind":"communicationUser","communicationUserId":"8:acs:12345678"},"id":"1737426610881","createdOn":"2025-01-21T02:30:10.881Z","version":"1737426610881","type":"Text","metadata":{"tags":"public","deliveryMode":"bridged","isBridged":"True"},"content":"https://support.microsoft.com/files?workspace=asdasdfasdfasdfasdf"}
            };

            logger.useTelemetry(telemetry as any);
            logger.logEvent(LogLevel.INFO, eventData as any);
            expect(telemetry.info).toHaveBeenCalledWith(expect.objectContaining({"ChatId": "", "ChatSDKRuntimeId": "", "Description":  "{\"message\":\"h**64 hidden**\",\"length\":931,\"senderDisplayName\":\"T**8 hidden**\",\"threadId\":\"19:123456@thread.v2\",\"sender\":{\"kind\":\"communicationUser\",\"communicationUserId\":\"8:acs:12345678\"},\"recipient\":{\"kind\":\"communicationUser\",\"communicationUserId\":\"8:acs:12345678\"},\"id\":1737426610881,\"createdOn\":\"2025-01-21T02:30:10.881Z\",\"version\":1737426610881,\"type\":\"Text\",\"metadata\":{\"tags\":\"public\",\"deliveryMode\":\"bridged\",\"isBridged\":\"True\"},\"content\":\"h**64 hidden**\"}","CustomProperties": "{\"threadId\":\"19:123456@thread.v2\",\"sender\":{\"kind\":\"communicationUser\",\"communicationUserId\":\"8:acs:12345678\"},\"senderDisplayName\":\"T**8 hidden**\",\"recipient\":{\"kind\":\"communicationUser\",\"communicationUserId\":\"8:acs:12345678\"},\"id\":1738036094447,\"createdOn\":\"2025-01-28T03:48:14.447Z\",\"version\":1738036094447,\"type\":\"Text\",\"message\":\"h**1 hidden**\",\"metadata\":{\"tags\":\"public\",\"deliveryMode\":\"bridged\",\"isBridged\":\"True\"},\"attachments\":[]}", "Event": "", "ExceptionDetails": "", "OrgId": "", "OrgUrl": "", "RequestId": "", "WidgetId": ""}),"occhatsdk_acsadapterevents");
        });

        it('ACSAdapterLogger.logEvent() with Exception details having PII data', () => {
            const logger = new ACSAdapterLogger(omnichannelConfig);
            telemetry.info.mockClear();
            const eventData = {
                Event: '',
                ExceptionDetails:{"name":"RestError","code":"REQUEST_SEND_ERROR","request":{"url":"https://12345678-occhannels-acs.australia.communication.azure.com/chat/threads/19%3A123456%40thread.v2/messages?api-version=2021-09-07&startTime=2025-01-27T01%3A56%3A54.000Z","headers":{"accept":"application/json","x-ms-useragent":"acs-webchat-adapter-0.0.35-beta.30.1 azsdk-js-communication-chat/^1.3.2","x-ms-client-request-id":"12344557","authorization":"Bearer ey12312312312b12312312asdfasdfasfasdfasdfads"},"method":"GET","timeout":0,"disableKeepAlive":false,"streamResponseStatusCodes":{},"withCredentials":false,"tracingOptions":{"tracingContext":{"_contextMap":{}}},"requestId":"12345678","allowInsecureConnection":false,"enableBrowserStreams":false}}
            };

            logger.useTelemetry(telemetry as any);
            logger.logEvent(LogLevel.INFO, eventData as any);
            expect(telemetry.info).toHaveBeenCalledWith(expect.objectContaining({"ChatId": "", "ChatSDKRuntimeId": "", "Event": "", "ExceptionDetails": "{\"name\":\"RestError\",\"code\":\"REQUEST_SEND_ERROR\",\"request\":{\"url\":\"https://12345678-occhannels-acs.australia.communication.azure.com/chat/threads/19%3A123456%40thread.v2/messages?api-version=2021-09-07&startTime=2025-01-27T01%3A56%3A54.000Z\",\"headers\":{\"accept\":\"application/json\",\"x-ms-useragent\":\"acs-webchat-adapter-0.0.35-beta.30.1 azsdk-js-communication-chat/^1.3.2\",\"x-ms-client-request-id\":12344557,\"authorization\":\"B**50 hidden**\"},\"method\":\"GET\",\"timeout\":0,\"disableKeepAlive\":false,\"streamResponseStatusCodes\":{},\"withCredentials\":false,\"tracingOptions\":{\"tracingContext\":{\"_contextMap\":{}}},\"requestId\":12345678,\"allowInsecureConnection\":false,\"enableBrowserStreams\":false}}" , "OrgId": "", "OrgUrl": "", "RequestId": "", "WidgetId": ""}),"occhatsdk_acsadapterevents");
        });

        it('ACSAdapterLogger.startScenario() should call ScenarioMarker.startScenario()', () => {
            const logger = new ACSAdapterLogger(omnichannelConfig);

            (logger as any).scenarioMarker = {
                startScenario: jest.fn(),
            }

            logger.startScenario('');

            expect((logger as any).scenarioMarker.startScenario).toHaveBeenCalledTimes(1);
        });

        it('ACSAdapterLogger.failScenario() should call ScenarioMarker.failScenario()', () => {
            const logger = new ACSAdapterLogger(omnichannelConfig);

            (logger as any).scenarioMarker = {
                failScenario: jest.fn(),
            }

            logger.failScenario('');

            expect((logger as any).scenarioMarker.failScenario).toHaveBeenCalledTimes(1);
        });

        it('ACSAdapterLogger.completeScenario() should call ScenarioMarker.completeScenario()', () => {
            const logger = new ACSAdapterLogger(omnichannelConfig);

            (logger as any).scenarioMarker = {
                completeScenario: jest.fn(),
            }

            logger.completeScenario('');

            expect((logger as any).scenarioMarker.completeScenario).toHaveBeenCalledTimes(1);
        });
    });

    describe('CallingSDKLogger', () => {
        const omnichannelConfig = {
            orgId: '',
            orgUrl: '',
            widgetId: ''
        }

        const telemetry = {
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            info: jest.fn()
        }

        it('CallingSDKLogger.logCallingSdkTelemetryEvent() with LogLevel DEBUG should call telemetry.debug()', () => {
            const logger = new CallingSDKLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logCallingSdkTelemetryEvent(LogLevel.DEBUG, eventData as any);

            expect(telemetry.debug).toBeCalledTimes(1);
        });

        it('CallingSDKLogger.logCallingSdkTelemetryEvent() with LogLevel WARN should call telemetry.warn()', () => {
            const logger = new CallingSDKLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logCallingSdkTelemetryEvent(LogLevel.WARN, eventData as any);

            expect(telemetry.warn).toBeCalledTimes(1);
        });

        it('CallingSDKLogger.logCallingSdkTelemetryEvent() with LogLevel ERROR should call telemetry.error()', () => {
            const logger = new CallingSDKLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logCallingSdkTelemetryEvent(LogLevel.ERROR, eventData as any);

            expect(telemetry.error).toBeCalledTimes(1);
        });

        it('CallingSDKLogger.logCallingSdkTelemetryEvent() with LogLevel INFO should call telemetry.info()', () => {
            const logger = new CallingSDKLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logCallingSdkTelemetryEvent(LogLevel.INFO, eventData as any);

            expect(telemetry.info).toBeCalledTimes(1);
        });
    });

    describe('AMSClientLogger', () => {
        const omnichannelConfig = {
            orgId: '',
            orgUrl: '',
            widgetId: ''
        }

        const telemetry = {
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            info: jest.fn()
        }

        it('AMSClientLogger.logClientSdkTelemetryEvent() with LogLevel DEBUG should call telemetry.debug()', () => {
            const logger = new AMSClientLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logClientSdkTelemetryEvent(LogLevel.DEBUG, eventData as any);

            expect(telemetry.debug).toBeCalledTimes(1);
        });

        it('AMSClientLogger.logClientSdkTelemetryEvent() with LogLevel WARN should call telemetry.warn()', () => {
            const logger = new AMSClientLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logClientSdkTelemetryEvent(LogLevel.WARN, eventData as any);

            expect(telemetry.warn).toBeCalledTimes(1);
        });

        it('AMSClientLogger.logClientSdkTelemetryEvent() with LogLevel ERROR should call telemetry.error()', () => {
            const logger = new AMSClientLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logClientSdkTelemetryEvent(LogLevel.ERROR, eventData as any);

            expect(telemetry.error).toBeCalledTimes(1);
        });

        it('AMSClientLogger.logClientSdkTelemetryEvent() with LogLevel INFO should call telemetry.info()', () => {
            const logger = new AMSClientLogger(omnichannelConfig);

            const eventData = {
                Event: ''
            };

            logger.useTelemetry(telemetry as any);
            logger.logClientSdkTelemetryEvent(LogLevel.INFO, eventData as any);

            expect(telemetry.info).toBeCalledTimes(1);
        });
    });
})