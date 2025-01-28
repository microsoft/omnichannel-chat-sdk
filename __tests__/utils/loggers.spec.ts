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
                    "threadId": "19:acsV1_QmJ5hZE2YVI0b-7oPltD-2WXaI_tQv30JdnoU1KyR3w1@thread.v2",
                    "sender": {
                        "kind": "communicationUser",
                        "communicationUserId": "8:acs:453332fc-94e7-403f-82a0-36f184b6412e_00000023-8893-99f9-df68-563a0d008263"
                    },
                    "senderDisplayName": "Mithun Chackankulam",
                    "recipient": {
                        "kind": "communicationUser",
                        "communicationUserId": "8:acs:453332fc-94e7-403f-82a0-36f184b6412e_00000025-4965-4edc-eaf3-543a0d007ddb"
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
                Description: {"message":"https://support.microsoft.com/files?workspace=eyJhbGciOiJSUzI1NiIsImtpZCI6IjgxMTA4NjE5MTQzMTQ1NTc0QUYxMjI3NjhGMEIzNDkyRkYyNTczNEYiLCJ0eXAiOiJKV1QifQ.eyJ3c2lkIjoiNzNjNDE0ZDUtY2RmZi00Mzg0LWJlN2ItNGQwOWVjOGQwMmUwIiwic3IiOiI3MDY0NjIzNzkyIiwic3YiOiJ2MSIsInJzIjoiRXh0ZXJuYWwiLCJ3dGlkIjoiOWJjMmYxM2MtNmIyZS00NTQxLTg1ZWItNTRlOWQwZWEzYTNjIiwiYXBwaWQiOiI0ZTc2ODkxZC04NDUwLTRlNWUtYmUzOC1lYTNiZDZlZjIxZTUiLCJuYmYiOjE3Mzc0MjY2MDQsImV4cCI6MTc0NTIwMjYwNCwiaWF0IjoxNzM3NDI2NjA0LCJpc3MiOiJodHRwczovL2FwaS5kdG1uZWJ1bGEubWljcm9zb2Z0LmNvbSIsImF1ZCI6Imh0dHA6Ly9zbWMifQ.F8UH1A7JSQOfIzv-ZpKvGZCfASbXwFg49DnvhchOR6YeONPz8QJhNJDZhSL6m5ztfVyVI5BGWV4d53hnrRRneifX6kgCsIyr97_5S2o_Ofu9gPCe_Wq4qgcahmckSIw4z13HZrPh3EHV1exhWa_PpDrQzjrqeijWWC_w7J7vA-FLtPRiErrctpU48mQyONbE17dM8qZ3i-jj1S2TDYLh1Ujnok5_kABMzhjulumkZEbEDOlmDexjDSJYSCZyXRE0ZaWVFt2BKS1R0u6nlSg3AAVYDzkASwvDzkks35xMeWutjbJEkBHRoHUu9ffn2OWrRpIy0eJYXf8U5Y1V1Rb8rQ&wid=73c414d5-cdff-4384-be7b-4d09ec8d02e0","length":931,"senderDisplayName":"Mithun Chackankulam","threadId":"19:acsV1_6KR4mCG8y4rSc9b9v3lgGfaXfcx_m98M8ecxIticGR41@thread.v2","sender":{"kind":"communicationUser","communicationUserId":"8:acs:409035c5-b285-4ca4-91cd-2b59eff23943_00000023-75bc-7845-ac00-343a0d00e069"},"recipient":{"kind":"communicationUser","communicationUserId":"8:acs:409035c5-b285-4ca4-91cd-2b59eff23943_00000025-268f-7eb2-d68a-084822007896"},"id":"1737426610881","createdOn":"2025-01-21T02:30:10.881Z","version":"1737426610881","type":"Text","metadata":{"tags":"public","deliveryMode":"bridged","isBridged":"True"},"content":"https://support.microsoft.com/files?workspace=eyJhbGciOiJSUzI1NiIsImtpZCI6IjgxMTA4NjE5MTQzMTQ1NTc0QUYxMjI3NjhGMEIzNDkyRkYyNTczNEYiLCJ0eXAiOiJKV1QifQ.eyJ3c2lkIjoiNzNjNDE0ZDUtY2RmZi00Mzg0LWJlN2ItNGQwOWVjOGQwMmUwIiwic3IiOiI3MDY0NjIzNzkyIiwic3YiOiJ2MSIsInJzIjoiRXh0ZXJuYWwiLCJ3dGlkIjoiOWJjMmYxM2MtNmIyZS00NTQxLTg1ZWItNTRlOWQwZWEzYTNjIiwiYXBwaWQiOiI0ZTc2ODkxZC04NDUwLTRlNWUtYmUzOC1lYTNiZDZlZjIxZTUiLCJuYmYiOjE3Mzc0MjY2MDQsImV4cCI6MTc0NTIwMjYwNCwiaWF0IjoxNzM3NDI2NjA0LCJpc3MiOiJodHRwczovL2FwaS5kdG1uZWJ1bGEubWljcm9zb2Z0LmNvbSIsImF1ZCI6Imh0dHA6Ly9zbWMifQ.F8UH1A7JSQOfIzv-ZpKvGZCfASbXwFg49DnvhchOR6YeONPz8QJhNJDZhSL6m5ztfVyVI5BGWV4d53hnrRRneifX6kgCsIyr97_5S2o_Ofu9gPCe_Wq4qgcahmckSIw4z13HZrPh3EHV1exhWa_PpDrQzjrqeijWWC_w7J7vA-FLtPRiErrctpU48mQyONbE17dM8qZ3i-jj1S2TDYLh1Ujnok5_kABMzhjulumkZEbEDOlmDexjDSJYSCZyXRE0ZaWVFt2BKS1R0u6nlSg3AAVYDzkASwvDzkks35xMeWutjbJEkBHRoHUu9ffn2OWrRpIy0eJYXf8U5Y1V1Rb8rQ&wid=73c414d5-cdff-4384-be7b-4d09ec8d02e0"}
            };

            logger.useTelemetry(telemetry as any);
            logger.logEvent(LogLevel.INFO, eventData as any);
            expect(telemetry.info).toHaveBeenCalledWith(expect.objectContaining({"ChatId": "", "ChatSDKRuntimeId": "", "Description":  "{\"message\":\"h**930 hidden**\",\"length\":931,\"senderDisplayName\":\"M**18 hidden**\",\"threadId\":\"19:acsV1_6KR4mCG8y4rSc9b9v3lgGfaXfcx_m98M8ecxIticGR41@thread.v2\",\"sender\":{\"kind\":\"communicationUser\",\"communicationUserId\":\"8:acs:409035c5-b285-4ca4-91cd-2b59eff23943_00000023-75bc-7845-ac00-343a0d00e069\"},\"recipient\":{\"kind\":\"communicationUser\",\"communicationUserId\":\"8:acs:409035c5-b285-4ca4-91cd-2b59eff23943_00000025-268f-7eb2-d68a-084822007896\"},\"id\":1737426610881,\"createdOn\":\"2025-01-21T02:30:10.881Z\",\"version\":1737426610881,\"type\":\"Text\",\"metadata\":{\"tags\":\"public\",\"deliveryMode\":\"bridged\",\"isBridged\":\"True\"},\"content\":\"h**930 hidden**\"}","CustomProperties": "{\"threadId\":\"19:acsV1_QmJ5hZE2YVI0b-7oPltD-2WXaI_tQv30JdnoU1KyR3w1@thread.v2\",\"sender\":{\"kind\":\"communicationUser\",\"communicationUserId\":\"8:acs:453332fc-94e7-403f-82a0-36f184b6412e_00000023-8893-99f9-df68-563a0d008263\"},\"senderDisplayName\":\"M**18 hidden**\",\"recipient\":{\"kind\":\"communicationUser\",\"communicationUserId\":\"8:acs:453332fc-94e7-403f-82a0-36f184b6412e_00000025-4965-4edc-eaf3-543a0d007ddb\"},\"id\":1738036094447,\"createdOn\":\"2025-01-28T03:48:14.447Z\",\"version\":1738036094447,\"type\":\"Text\",\"message\":\"h**1 hidden**\",\"metadata\":{\"tags\":\"public\",\"deliveryMode\":\"bridged\",\"isBridged\":\"True\"},\"attachments\":[]}", "Event": "", "ExceptionDetails": "", "OrgId": "", "OrgUrl": "", "RequestId": "", "WidgetId": ""}),"occhatsdk_acsadapterevents");
        });

        it('ACSAdapterLogger.logEvent() with Exception details having PII data', () => {
            const logger = new ACSAdapterLogger(omnichannelConfig);
            telemetry.info.mockClear();
            const eventData = {
                Event: '',
                ExceptionDetails:{"name":"RestError","code":"REQUEST_SEND_ERROR","request":{"url":"https://e567d52f-433f-4ab3-bbc6-cb791205eb51-occhannels-acs.australia.communication.azure.com/chat/threads/19%3AacsV1_qdjQ1NDvFE4_HYImbCAWacRtmcDwbXtWP4HcL1-eUvw1%40thread.v2/messages?api-version=2021-09-07&startTime=2025-01-27T01%3A56%3A54.000Z","headers":{"accept":"application/json","x-ms-useragent":"acs-webchat-adapter-0.0.35-beta.30.1 azsdk-js-communication-chat/^1.3.2","x-ms-client-request-id":"7816aa66-0c10-4de1-bcc5-8fbdece946f6","authorization":"Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjU3Qjg2NEUwQjM0QUQ0RDQyRTM3OTRBRTAyNTAwRDVBNTE5MjA1RjUiLCJ4NXQiOiJWN2hrNExOSzFOUXVONVN1QWxBTldsR1NCZlUiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOjA1ZDQ0MWIzLTg4MWEtNDZjYi1hNDJkLTcwNGI4NDNhZGZhOV8wMDAwMDAyNS00NTU4LTk3ZGYtYzQwZi02YjNhMGQwMDU0MjIiLCJzY3AiOjE3OTIsImNzaSI6IjE3Mzc5NDI4MjMiLCJleHAiOjE3MzgwMjkyMjMsInJnbiI6ImF1IiwiYWNzU2NvcGUiOiJjaGF0LmpvaW4ubGltaXRlZCx2b2lwIiwicmVzb3VyY2VJZCI6IjA1ZDQ0MWIzLTg4MWEtNDZjYi1hNDJkLTcwNGI4NDNhZGZhOSIsInJlc291cmNlTG9jYXRpb24iOiJhdXN0cmFsaWEiLCJpYXQiOjE3Mzc5NDI4MjR9.dLvaPa7vwJ6iwCa08oFxwC9VEQUWKhI-rreAVKM-gxSc6u-zTQmAWomy_TfOQ6bkSGn7YAwJlDI7K_PUh13zYHY_yE_HrEXyf7V2GLnpRnKxFJ-hn-vPcSZh8QOJLwGn89SeKuA3WICpUOrJ0aXQ0RwwJK0PvrjCbWAAzOlNAVMPBLORnj6ogQhd8VpY2TIZHjXjsj5jMN4aP38N1ri6ECm-aaWbY3T-4ThrdQCU56m7Y7zrxb3HGgPBY5Rt0dBurNZujhVQzjiF5cYjbmYyXrpP75G8zi2oNnig24oZZ0bUg-ZIaqicuxQFnKPijsO5p39elaOqhhCZQCjqR2O7Pg"},"method":"GET","timeout":0,"disableKeepAlive":false,"streamResponseStatusCodes":{},"withCredentials":false,"tracingOptions":{"tracingContext":{"_contextMap":{}}},"requestId":"7816aa66-0c10-4de1-bcc5-8fbdece946f6","allowInsecureConnection":false,"enableBrowserStreams":false}}
            };

            logger.useTelemetry(telemetry as any);
            logger.logEvent(LogLevel.INFO, eventData as any);
            expect(telemetry.info).toHaveBeenCalledWith(expect.objectContaining({"ChatId": "", "ChatSDKRuntimeId": "", "Event": "", "ExceptionDetails": "{\"name\":\"RestError\",\"code\":\"REQUEST_SEND_ERROR\",\"request\":{\"url\":\"https://e567d52f-433f-4ab3-bbc6-cb791205eb51-occhannels-acs.australia.communication.azure.com/chat/threads/19%3AacsV1_qdjQ1NDvFE4_HYImbCAWacRtmcDwbXtWP4HcL1-eUvw1%40thread.v2/messages?api-version=2021-09-07&startTime=2025-01-27T01%3A56%3A54.000Z\",\"headers\":{\"accept\":\"application/json\",\"x-ms-useragent\":\"acs-webchat-adapter-0.0.35-beta.30.1 azsdk-js-communication-chat/^1.3.2\",\"x-ms-client-request-id\":\"7816aa66-0c10-4de1-bcc5-8fbdece946f6\",\"authorization\":\"B**880 hidden**\"},\"method\":\"GET\",\"timeout\":0,\"disableKeepAlive\":false,\"streamResponseStatusCodes\":{},\"withCredentials\":false,\"tracingOptions\":{\"tracingContext\":{\"_contextMap\":{}}},\"requestId\":\"7816aa66-0c10-4de1-bcc5-8fbdece946f6\",\"allowInsecureConnection\":false,\"enableBrowserStreams\":false}}" , "OrgId": "", "OrgUrl": "", "RequestId": "", "WidgetId": ""}),"occhatsdk_acsadapterevents");
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