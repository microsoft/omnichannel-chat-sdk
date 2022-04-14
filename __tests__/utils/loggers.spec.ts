import LogLevel from '@microsoft/omnichannel-ic3core/lib/logging/LogLevel';
import {ACSAdapterLogger, ACSClientLogger, IC3ClientLogger, OCSDKLogger, CallingSDKLogger} from '../../src/utils/loggers';

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
})