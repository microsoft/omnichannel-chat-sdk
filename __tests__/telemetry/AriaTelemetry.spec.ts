import AriaTelemetry from '../../src/telemetry/AriaTelemetry';
import ScenarioType from '../../src/telemetry/ScenarioType';
import * as settings from '../../src/config/settings';

describe('AriaTelemetry', () => {
    (settings as any).ariaTelemetryKey = '';

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();

        (AriaTelemetry as any)._disable = false;
        (AriaTelemetry as any)._logger = {
            logEvent: jest.fn()
        };

        (global as any).window = {};
        (global as any).navigator = undefined;
    });

    it('AriaTelemetry.disable() have telemetry enabled by default', () => {
        expect((AriaTelemetry as any)._disable).toBe(false);
    });

    it('AriaTelemetry.disable() should disable telemetry', () => {
        AriaTelemetry.disable();
        expect((AriaTelemetry as any)._disable).toBe(true);
    });

    it('AriaTelemetry.setCDNPackages() should update AriaTelemetry._CDNPackagesInfo', () => {
        const packages = {
            IC3Client: 'IC3Client',
            IC3Adapter: 'IC3Adapter',
        };

        AriaTelemetry.setCDNPackages(packages);

        expect((AriaTelemetry as any)._CDNPackagesInfo).toEqual(packages);
    });

    it('AriaTelemetry.setCDNPackages() should be able to override previous AriaTelemetry._CDNPackagesInfo', () => {
        const packages = {
            IC3Client: 'IC3Client',
            IC3Adapter: 'IC3Adapter',
        };

        const overridePackages = {
            IC3Client: 'override',
            IC3Adapter: 'override',
        };

        AriaTelemetry.setCDNPackages(packages);
        AriaTelemetry.setCDNPackages(overridePackages);

        expect((AriaTelemetry as any)._CDNPackagesInfo).toEqual(overridePackages);
    });

    it('AriaTelemetry.populateBaseProperties() should have all the necessary properties', () => {
        const properties = (AriaTelemetry as any).populateBaseProperties();

        expect(properties.OrgId).toBeDefined();
        expect(properties.OrgUrl).toBeDefined();
        expect(properties.WidgetId).toBeDefined();
        expect(properties.RequestId).toBeDefined();
        expect(properties.ChatId).toBeDefined();
        expect(properties.CallId).toBeDefined();
        expect(properties.Domain).toBeDefined();
        expect(properties.ExceptionDetails).toBeDefined();
        expect(properties.ElapsedTimeInMilliseconds).toBeDefined();
        expect(properties.ChatSDKVersion).toBeDefined();
        expect(properties.NPMPackagesInfo).toBeDefined();
        expect(properties.CDNPackagesInfo).toBeDefined();
        expect(properties.PlatformDetails).toBeDefined();
    });

    it('AriaTelemetry.fillMobilePlatformData() should return {} on Node', () => {
        const platformData = (AriaTelemetry as any).fillMobilePlatformData();
        expect(platformData).toEqual({});
    });

    it('AriaTelemetry.fillMobilePlatformData() should return correct platform data if OS is Android', () => {
        (global as any).navigator = {};
        (global.navigator as any).product = 'ReactNative';

        const mobileOS = 'Android';
        const platformData = {
            OS: mobileOS.toLowerCase(),
            Version: 'Version'
        };

        jest.mock('react-native', () => {
            return {
                Platform: {
                    ...platformData
                }
            }
        }, {virtual: true});

        const mobilePlatformData = (AriaTelemetry as any).fillMobilePlatformData();
        expect(mobilePlatformData.DeviceInfo_OsName).toBe(mobileOS);
        expect(mobilePlatformData.DeviceInfo_OsVersion).toBe(platformData.Version);
    });

    it('AriaTelemetry.fillMobilePlatformData() should return correct platform data if OS is iOS', () => {
        (global as any).navigator = {};
        (global.navigator as any).product = 'ReactNative';

        const mobileOS = 'iOS';
        const platformData = {
            OS: mobileOS.toLowerCase(),
            Version: 'Version'
        };

        jest.mock('react-native', () => {
            return {
                Platform: {
                    ...platformData
                }
            }
        }, {virtual: true});

        const mobilePlatformData = (AriaTelemetry as any).fillMobilePlatformData();
        expect(mobilePlatformData.DeviceInfo_OsName).toBe(mobileOS);
        expect(mobilePlatformData.DeviceInfo_OsVersion).toBe(platformData.Version);
    });

    it('AriaTelemetry.fillMobilePlatformData() should return correct platform data if OS is other', () => {
        (global as any).navigator = {};
        (global.navigator as any).product = 'ReactNative';

        const mobileOS = 'other';
        const platformData = {
            OS: mobileOS.toLowerCase(),
            Version: 'Version'
        };

        jest.mock('react-native', () => {
            return {
                Platform: {
                    ...platformData
                }
            }
        }, {virtual: true});

        const mobilePlatformData = (AriaTelemetry as any).fillMobilePlatformData();
        expect(mobilePlatformData.DeviceInfo_OsName).toBe(mobileOS);
        expect(mobilePlatformData.DeviceInfo_OsVersion).toBe(platformData.Version);
    });

    it('AriaTelemetry.fillWebPlatformData() should return nothing if window object does not exist', () => {
        const webPlatformData = (AriaTelemetry as any).fillWebPlatformData();
        expect(Object.keys(webPlatformData).length).toBe(0);
    });

    it('AriaTelemetry.info() should call AriaTelemetry.logger.logEvent()', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.info({});

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent).toHaveBeenCalled();
    });

    it('AriaTelemetry.debug() should call AriaTelemetry.logger.logEvent()', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.debug({});

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent).toHaveBeenCalled();
    });

    it('AriaTelemetry.warn() should call AriaTelemetry.logger.logEvent()', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.warn({});

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent).toHaveBeenCalled();
    });

    it('AriaTelemetry.error() should call AriaTelemetry.logger.logEvent()', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.error({});

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent).toHaveBeenCalled();
    });

    it('AriaTelemetry.log() should call AriaTelemetry.logger.logEvent()', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.log({});

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent).toHaveBeenCalled();
    });

    it('AriaTelemetry.info() for OCSDK should send OCSDK telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.info({}, ScenarioType.OCSDK);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.OCSDK);
    });

    it('AriaTelemetry.debug() for OCSDK should send OCSDK telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.debug({}, ScenarioType.OCSDK);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.OCSDK);
    });

    it('AriaTelemetry.warn() for OCSDK should send OCSDK telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.warn({}, ScenarioType.OCSDK);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.OCSDK);
    });

    it('AriaTelemetry.error() for OCSDK should send OCSDK telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.error({}, ScenarioType.OCSDK);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.OCSDK);
    });

    it('AriaTelemetry.log() for OCSDK should send OCSDK telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.log({}, ScenarioType.OCSDK);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.OCSDK);
    });

    it('AriaTelemetry.info() for IC3CLIENT should send IC3CLIENT telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.info({}, ScenarioType.IC3CLIENT);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.IC3CLIENT);
    });

    it('AriaTelemetry.debug() for IC3CLIENT should send IC3CLIENT telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.debug({}, ScenarioType.IC3CLIENT);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.IC3CLIENT);
    });

    it('AriaTelemetry.warn() for IC3CLIENT should send IC3CLIENT telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.warn({}, ScenarioType.IC3CLIENT);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.IC3CLIENT);
    });

    it('AriaTelemetry.error() for IC3CLIENT should send IC3CLIENT telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.error({}, ScenarioType.IC3CLIENT);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.IC3CLIENT);
    });

    it('AriaTelemetry.log() for IC3CLIENT should send IC3CLIENT telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.log({}, ScenarioType.IC3CLIENT);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.IC3CLIENT);
    });

    it('AriaTelemetry.info() for ACSCLIENT should send ACSCLIENT telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.info({}, ScenarioType.ACSCLIENT);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.ACSCLIENT);
    });

    it('AriaTelemetry.debug() for ACSCLIENT should send ACSCLIENT telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.debug({}, ScenarioType.ACSCLIENT);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.ACSCLIENT);
    });

    it('AriaTelemetry.warn() for ACSCLIENT should send ACSCLIENT telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.warn({}, ScenarioType.ACSCLIENT);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.ACSCLIENT);
    });

    it('AriaTelemetry.error() for ACSCLIENT should send ACSCLIENT telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.error({}, ScenarioType.ACSCLIENT);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.ACSCLIENT);
    });

    it('AriaTelemetry.log() for ACSCLIENT should send ACSCLIENT telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.log({}, ScenarioType.ACSCLIENT);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.ACSCLIENT);
    });

    it('AriaTelemetry.info() for ACSADAPTER should send ACSADAPTER telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.info({}, ScenarioType.ACSADAPTER);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.ACSADAPTER);
    });

    it('AriaTelemetry.debug() for ACSADAPTER should send ACSADAPTER telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.debug({}, ScenarioType.ACSADAPTER);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.ACSADAPTER);
    });

    it('AriaTelemetry.warn() for ACSADAPTER should send ACSADAPTER telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.warn({}, ScenarioType.ACSADAPTER);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.ACSADAPTER);
    });

    it('AriaTelemetry.error() for ACSADAPTER should send ACSADAPTER telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.error({}, ScenarioType.ACSADAPTER);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.ACSADAPTER);
    });

    it('AriaTelemetry.log() for ACSADAPTER should send ACSADAPTER telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.log({}, ScenarioType.ACSADAPTER);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.ACSADAPTER);
    });

    it('AriaTelemetry.info() for CALLINGSDK should send CALLINGSDK telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.info({}, ScenarioType.CALLINGSDK);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.CALLINGSDK);
    });

    it('AriaTelemetry.debug() for CALLINGSDK should send CALLINGSDK telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.debug({}, ScenarioType.CALLINGSDK);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.CALLINGSDK);
    });

    it('AriaTelemetry.warn() for CALLINGSDK should send CALLINGSDK telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.warn({}, ScenarioType.CALLINGSDK);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.CALLINGSDK);
    });

    it('AriaTelemetry.error() for CALLINGSDK should send CALLINGSDK telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.error({}, ScenarioType.CALLINGSDK);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.CALLINGSDK);
    });

    it('AriaTelemetry.log() for CALLINGSDK should send CALLINGSDK telemetry data', () => {
        jest.spyOn((AriaTelemetry as any).logger, 'logEvent');
        AriaTelemetry.log({}, ScenarioType.CALLINGSDK);

        expect((AriaTelemetry as any)._disable).toBe(false);
        expect((AriaTelemetry as any).logger.logEvent.mock.calls[0][0].name).toBe(ScenarioType.CALLINGSDK);
    });
});