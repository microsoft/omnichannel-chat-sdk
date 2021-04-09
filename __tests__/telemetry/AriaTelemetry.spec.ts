import AriaTelemetry from '../../src/telemetry/AriaTelemetry';
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

    it('AriaTelemetry.fillMobilePlatformData() should return {} on Node', () => {
        const platformData = (AriaTelemetry as any).fillMobilePlatformData();
        expect(platformData).toEqual({});
    });

    it('AriaTelemetry.fillMobilePlatformData() should return correct platform data if OS is Android', () => {
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
});