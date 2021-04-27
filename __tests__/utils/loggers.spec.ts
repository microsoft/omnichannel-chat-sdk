import LogLevel from '@microsoft/omnichannel-ic3core/lib/logging/LogLevel';
import {IC3ClientLogger, OCSDKLogger} from '../../src/utils/loggers';

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
})