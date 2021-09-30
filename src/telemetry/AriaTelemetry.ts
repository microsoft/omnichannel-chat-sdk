import { ariaTelemetryKey } from '../config/settings';
import { AWTEventPriority } from '../external/aria/common/Enums';
import { AWTLogManager, AWTLogger, AWTEventData } from '../external/aria/webjs/AriaSDK';
import LogLevel from '../telemetry/LogLevel';
import ScenarioType from '../telemetry/ScenarioType';
import { ic3ClientVersion } from '../config/settings';

interface BaseContract {
    OrgId: string;
    OrgUrl: string;
    WidgetId: string;
    RequestId?: string;
    ChatId?: string;
    CallId?: string;
    Domain?: string;
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
    ACSAdapter?: string;
    SpoolSDK?: string;
    VoiceVideoCalling?: string;
}

interface IC3ClientContract {
    OrgId: string;
    OrgUrl: string;
    WidgetId: string;
    RequestId: string;
    ChatId: string;
    Event?: string;
    Description?: string;
    SubscriptionId?: string;
    EndpointId?: string;
    EndpointUrl?: string;
    ErrorCode?: string;
    ExceptionDetails?: string;
    ElapsedTimeInMilliseconds?: string;
    IC3ClientVersion: string;
}

interface OCSDKContract {
    OrgId: string;
    OrgUrl: string;
    WidgetId: string;
    RequestId: string;
    ChatId: string;
    TransactionId: string;
    Event?: string;
    ExceptionDetails?: string;
    ElapsedTimeInMilliseconds?: string;
    OCSDKVersion: string;
}

class AriaTelemetry {
    private static _logger: AWTLogger;
    private static _debug = false;
    private static _CDNPackagesInfo: CDNPackagesInfo;
    private static _disable = false;

    public static initialize(key: string): void {
        /* istanbul ignore next */
        this._debug && console.log(`[AriaTelemetry][logger][initialize][custom]`);
        AriaTelemetry._logger = AWTLogManager.initialize(key);
    }

    /* istanbul ignore next */
    public static setDebug(flag: boolean): void {
        AriaTelemetry._debug = flag;
    }

    public static disable(): void {
        /* istanbul ignore next */
        this._debug && console.log(`[AriaTelemetry][disable]`);
        AriaTelemetry._disable = true;
    }

    public static setCDNPackages(packages: CDNPackagesInfo): void {
        AriaTelemetry._CDNPackagesInfo = {
            ...AriaTelemetry._CDNPackagesInfo,
            ...packages
        };
    }

    public static info(properties: AWTEventData["properties"], scenarioType: ScenarioType = ScenarioType.EVENTS): void {
        let event = {
            name: ScenarioType.EVENTS,
            properties: {
                ...AriaTelemetry.populateBaseProperties(),
                ...AriaTelemetry.fillWebPlatformData(),
                ...AriaTelemetry.fillMobilePlatformData(),
                ...properties,
                LogLevel: LogLevel.INFO
            },
            priority: AWTEventPriority.High
        };

        if (scenarioType == ScenarioType.IC3CLIENT) {
            event = {
                name: ScenarioType.IC3CLIENT,
                properties: {
                    ...AriaTelemetry.populateIC3ClientBaseProperties(),
                    ...properties,
                    LogLevel: LogLevel.INFO
                },
                priority: AWTEventPriority.High
            }
        }

        if (scenarioType == ScenarioType.OCSDK) {
            event = {
                name: ScenarioType.OCSDK,
                properties: {
                    ...AriaTelemetry.populateOCSDKBaseProperties(),
                    ...properties,
                    LogLevel: LogLevel.INFO
                },
                priority: AWTEventPriority.High
            }
        }

        /* istanbul ignore next */
        this._debug && console.log(`[AriaTelemetry][info] ${scenarioType}`);
        /* istanbul ignore next */
        this._debug && console.log(event);
        /* istanbul ignore next */
        this._debug && console.log(event.properties.Event);

        !AriaTelemetry._disable && AriaTelemetry.logger?.logEvent(event);
    }

    public static debug(properties: AWTEventData["properties"], scenarioType: ScenarioType = ScenarioType.EVENTS): void {
        let event = {
            name: ScenarioType.EVENTS,
            properties: {
                ...AriaTelemetry.populateBaseProperties(),
                ...AriaTelemetry.fillWebPlatformData(),
                ...AriaTelemetry.fillMobilePlatformData(),
                ...properties,
                LogLevel: LogLevel.DEBUG
            },
            priority: AWTEventPriority.High
        };

        if (scenarioType == ScenarioType.IC3CLIENT) {
            event = {
                name: ScenarioType.IC3CLIENT,
                properties: {
                    ...AriaTelemetry.populateIC3ClientBaseProperties(),
                    ...properties,
                    LogLevel: LogLevel.DEBUG
                },
                priority: AWTEventPriority.High
            }
        }

        if (scenarioType == ScenarioType.OCSDK) {
            event = {
                name: ScenarioType.OCSDK,
                properties: {
                    ...AriaTelemetry.populateOCSDKBaseProperties(),
                    ...properties,
                    LogLevel: LogLevel.DEBUG
                },
                priority: AWTEventPriority.High
            }
        }

        /* istanbul ignore next */
        this._debug && console.log(`[AriaTelemetry][debug] ${scenarioType}`);
        /* istanbul ignore next */
        this._debug && console.log(event);
        /* istanbul ignore next */
        this._debug && console.log(event.properties.Event);

        !AriaTelemetry._disable && AriaTelemetry.logger?.logEvent(event);
    }

    public static warn(properties: AWTEventData["properties"], scenarioType: ScenarioType = ScenarioType.EVENTS): void {
        let event = {
            name: ScenarioType.EVENTS,
            properties: {
                ...AriaTelemetry.populateBaseProperties(),
                ...AriaTelemetry.fillWebPlatformData(),
                ...AriaTelemetry.fillMobilePlatformData(),
                ...properties,
                LogLevel: LogLevel.WARN,
            },
            priority: AWTEventPriority.High
        };

        if (scenarioType == ScenarioType.IC3CLIENT) {
            event = {
                name: ScenarioType.IC3CLIENT,
                properties: {
                    ...AriaTelemetry.populateIC3ClientBaseProperties(),
                    ...properties,
                    LogLevel: LogLevel.WARN
                },
                priority: AWTEventPriority.High
            }
        }

        if (scenarioType == ScenarioType.OCSDK) {
            event = {
                name: ScenarioType.OCSDK,
                properties: {
                    ...AriaTelemetry.populateOCSDKBaseProperties(),
                    ...properties,
                    LogLevel: LogLevel.WARN
                },
                priority: AWTEventPriority.High
            }
        }

        /* istanbul ignore next */
        this._debug && console.log(`[AriaTelemetry][warn] ${scenarioType}`);
        /* istanbul ignore next */
        this._debug && console.log(event);
        /* istanbul ignore next */
        this._debug && console.log(event.properties.Event);

        !AriaTelemetry._disable && AriaTelemetry.logger?.logEvent(event);
    }

    public static error(properties: AWTEventData["properties"], scenarioType: ScenarioType = ScenarioType.EVENTS): void {
        let event = {
            name: ScenarioType.EVENTS,
            properties: {
                ...AriaTelemetry.populateBaseProperties(),
                ...AriaTelemetry.fillWebPlatformData(),
                ...AriaTelemetry.fillMobilePlatformData(),
                ...properties,
                LogLevel: LogLevel.ERROR
            },
            priority: AWTEventPriority.High
        };

        if (scenarioType == ScenarioType.IC3CLIENT) {
            event = {
                name: ScenarioType.IC3CLIENT,
                properties: {
                    ...AriaTelemetry.populateIC3ClientBaseProperties(),
                    ...properties,
                    LogLevel: LogLevel.ERROR
                },
                priority: AWTEventPriority.High
            }
        }

        if (scenarioType == ScenarioType.OCSDK) {
            event = {
                name: ScenarioType.OCSDK,
                properties: {
                    ...AriaTelemetry.populateOCSDKBaseProperties(),
                    ...properties,
                    LogLevel: LogLevel.ERROR
                },
                priority: AWTEventPriority.High
            }
        }

        /* istanbul ignore next */
        this._debug && console.log(`[AriaTelemetry][error] ${scenarioType}`);
        /* istanbul ignore next */
        this._debug && console.log(event);
        /* istanbul ignore next */
        this._debug && console.log(event.properties.Event);

        !AriaTelemetry._disable && AriaTelemetry.logger?.logEvent(event);
    }

    public static log(properties: AWTEventData["properties"], scenarioType: ScenarioType = ScenarioType.EVENTS): void {
        let event = {
            name: ScenarioType.EVENTS,
            properties: {
                ...AriaTelemetry.populateBaseProperties(),
                ...AriaTelemetry.fillWebPlatformData(),
                ...AriaTelemetry.fillMobilePlatformData(),
                ...properties,
                LogLevel: LogLevel.LOG
            },
            priority: AWTEventPriority.High
        };

        if (scenarioType == ScenarioType.IC3CLIENT) {
            event = {
                name: ScenarioType.IC3CLIENT,
                properties: {
                    ...AriaTelemetry.populateIC3ClientBaseProperties(),
                    ...properties,
                    LogLevel: LogLevel.LOG
                },
                priority: AWTEventPriority.High
            }
        }

        if (scenarioType == ScenarioType.OCSDK) {
            event = {
                name: ScenarioType.OCSDK,
                properties: {
                    ...AriaTelemetry.populateOCSDKBaseProperties(),
                    ...properties,
                    LogLevel: LogLevel.LOG
                },
                priority: AWTEventPriority.High
            }
        }

        /* istanbul ignore next */
        this._debug && console.log(`[AriaTelemetry][log]`);
        /* istanbul ignore next */
        this._debug && console.log(event);
        /* istanbul ignore next */
        this._debug && console.log(event.properties.Event);

        !AriaTelemetry._disable && AriaTelemetry.logger?.logEvent(event);
    }

    private static get logger(): AWTLogger {
        if (!AriaTelemetry._logger) {
            /* istanbul ignore next */
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
            CallId: '',
            Domain: '',
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

            /* istanbul ignore next */
            this._debug && console.log(`[AriaTelemetry][fillMobilePlatformData][${platformData.DeviceInfo_OsName}]`);
        } catch {
            /* istanbul ignore next */
            this._debug && console.log("[AriaTelemetry][fillMobilePlatformData][Web]");
        }

        return platformData;
    }

    private static fillWebPlatformData() {
        const platformData: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

        if (!window) {
            return platformData;
        }

        try {
            platformData.Domain = window.location.origin || '';

            /* istanbul ignore next */
            this._debug && console.log(`[AriaTelemetry][fillWebPlatformData]`);
        } catch {
            /* istanbul ignore next */
            this._debug && console.log("[AriaTelemetry][fillWebPlatformData][Error]");
        }

        return platformData;
    }

    private static populateIC3ClientBaseProperties(): IC3ClientContract {
        return {
            OrgId: '',
            OrgUrl: '',
            WidgetId: '',
            RequestId: '',
            ChatId: '',
            Event: '',
            Description: '',
            SubscriptionId: '',
            EndpointId: '',
            EndpointUrl: '',
            ErrorCode: '',
            ExceptionDetails: '',
            ElapsedTimeInMilliseconds: '',
            IC3ClientVersion: ic3ClientVersion
        }
    }

    private static populateOCSDKBaseProperties(): OCSDKContract {
        return {
            OrgId: '',
            OrgUrl: '',
            WidgetId: '',
            RequestId: '',
            ChatId: '',
            TransactionId: '',
            Event: '',
            ExceptionDetails: '',
            ElapsedTimeInMilliseconds: '',
            OCSDKVersion: require('@microsoft/ocsdk/package.json').version // eslint-disable-line @typescript-eslint/no-var-requires
        }
    }
}

export default AriaTelemetry;