import AriaTelemetry from '../../src/telemetry/AriaTelemetry';
import * as settings from '../../src/config/settings';

describe('AriaTelemetry', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('AriaTelemetry.disable() have telemetry enabled by default', () => {
        jest.spyOn(AriaTelemetry, 'disable');

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
});