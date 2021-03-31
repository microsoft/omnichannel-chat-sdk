import { ariaTelemetryKey } from '../config/settings';
import { AWTEventPriority } from '../external/aria/common/Enums';
import { AWTLogManager, AWTLogger, AWTEventData } from '../external/aria/webjs/AriaSDK';
import LogLevel from '../telemetry/LogLevel';
import ScenarioType from '../telemetry/ScenarioType';

interface BaseContract {
    OrgId: string;
    OrgUrl: string;
    WidgetId: string;
    RequestId?: string;
    ChatId?: string;
    ExceptionDetails?: string;
    ElapsedTimeInMilliseconds?: string;
    ChatSDKVersion: string;
    NPMPackagesInfo?: string;
    CDNPackagesInfo?: string;
}

interface NPMPackagesInfo {
    OCSDK: string;
    IC3Core?: string;
}

interface CDNPackagesInfo {
    IC3Client?: string;
    IC3Adapter?: string;
    SpoolSDK?: string;
    VoiceVideoCalling?: string;
}

class AriaTelemetry {
    private static _logger: AWTLogger;
    private static _debug = true;
    private static _CDNPackagesInfo: CDNPackagesInfo;
    private static _disable = false;

    public static setDebug(flag: boolean): void {
        AriaTelemetry._debug = flag;
    }

    public static disable(): void {
        AriaTelemetry._disable = false;
    }

    public static setCDNPackages(packages: CDNPackagesInfo): void {
        AriaTelemetry._CDNPackagesInfo = {
            ...AriaTelemetry._CDNPackagesInfo,
            ...packages
        };
    }

    public static info(properties: AWTEventData["properties"]): void {
        const event = {
            name: ScenarioType.EVENTS,
            properties: {
                ...AriaTelemetry.populateBaseProperties(),
                ...AriaTelemetry.fillMobilePlatformData(),
                ...properties,
                LogLevel: LogLevel.INFO
            },
            priority: AWTEventPriority.High
        };

        this._debug && console.log(`[AriaTelemetry][info]`);
        this._debug && console.log(event);
        !AriaTelemetry._disable && AriaTelemetry.logger.logEvent(event);
    }

    public static debug(properties: AWTEventData["properties"]): void {
        const event = {
            name: ScenarioType.EVENTS,
            properties: {
                ...AriaTelemetry.populateBaseProperties(),
                ...AriaTelemetry.fillMobilePlatformData(),
                ...properties,
                LogLevel: LogLevel.DEBUG
            },
            priority: AWTEventPriority.High
        };

        this._debug && console.log(`[AriaTelemetry][debug]`);
        this._debug && console.log(event);
        !AriaTelemetry._disable && AriaTelemetry.logger.logEvent(event);
    }

    public static warn(properties: AWTEventData["properties"]): void {
        const event = {
            name: ScenarioType.EVENTS,
            properties: {
                ...AriaTelemetry.populateBaseProperties(),
                ...AriaTelemetry.fillMobilePlatformData(),
                ...properties,
                LogLevel: LogLevel.WARN,
            },
            priority: AWTEventPriority.High
        };

        this._debug && console.log(`[AriaTelemetry][warn]`);
        this._debug && console.log(event);
        !AriaTelemetry._disable && AriaTelemetry.logger.logEvent(event);
    }

    public static error(properties: AWTEventData["properties"]): void {
        const event = {
            name: ScenarioType.EVENTS,
            properties: {
                ...AriaTelemetry.populateBaseProperties(),
                ...AriaTelemetry.fillMobilePlatformData(),
                ...properties,
                LogLevel: LogLevel.ERROR
            },
            priority: AWTEventPriority.High
        };

        this._debug && console.log(`[AriaTelemetry][error]`);
        this._debug && console.log(event);
        !AriaTelemetry._disable && AriaTelemetry.logger.logEvent(event);
    }

    public static log(properties: AWTEventData["properties"]): void {
        const event = {
            name: ScenarioType.EVENTS,
            properties: {
                ...AriaTelemetry.populateBaseProperties(),
                ...AriaTelemetry.fillMobilePlatformData(),
                ...properties,
                LogLevel: LogLevel.LOG
            },
            priority: AWTEventPriority.High
        };

        this._debug && console.log(`[AriaTelemetry][log]`);
        this._debug && console.log(event);
        !AriaTelemetry._disable && AriaTelemetry.logger.logEvent(event);
    }

    private static get logger(): AWTLogger {
        if (!AriaTelemetry._logger) {
            this._debug && console.log(`[AriaTelemetry][logger][initialize]`);
            AriaTelemetry._logger = AWTLogManager.initialize(ariaTelemetryKey);
        }
        return AriaTelemetry._logger;
    }

    private static populateBaseProperties(): BaseContract {
        const packagesInfo: NPMPackagesInfo = {
            OCSDK: require('@microsoft/ocsdk/package.json').version, // eslint-disable-line @typescript-eslint/no-var-requires
            IC3Core: require('@microsoft/omnichannel-ic3core/package.json').version, // eslint-disable-line @typescript-eslint/no-var-requires
        };

        return {
            OrgId: '',
            OrgUrl: '',
            WidgetId: '',
            RequestId: '',
            ChatId: '',
            ExceptionDetails: '',
            ElapsedTimeInMilliseconds: '',
            ChatSDKVersion: require('../../package.json').version, // eslint-disable-line @typescript-eslint/no-var-requires
            NPMPackagesInfo: JSON.stringify(packagesInfo),
            CDNPackagesInfo: JSON.stringify(AriaTelemetry._CDNPackagesInfo)
        };
    }

    private static fillMobilePlatformData() {
        const platformData: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
        try {
            const ReactNative = require('react-native'); // eslint-disable-line @typescript-eslint/no-var-requires
            const Platform = ReactNative.Platform;

            platformData.DeviceInfo_OsVersion = Platform.Version;

            if (Platform.OS === 'android') {
                platformData.DeviceInfo_OsName = 'Android';
            } else if (Platform.OS === 'ios') {
                platformData.DeviceInfo_OsName = 'iOS';
            } else {
                platformData.DeviceInfo_OsName = `${Platform.OS}`;
            }

            this._debug && console.log(`[AriaTelemetry][fillMobilePlatformData][${platformData.DeviceInfo_OsName}]`);
        } catch {
            this._debug && console.log("[AriaTelemetry][fillMobilePlatformData][Web]");
        }

        return platformData;
    }
}

export default AriaTelemetry;