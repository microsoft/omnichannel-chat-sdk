import LogLevel from "@microsoft/omnichannel-ic3core/lib/logging/LogLevel";
import IOmnichannelConfig from "../core/IOmnichannelConfig";
import { AWTEventData } from "../external/aria/webjs/AriaSDK";
import IIC3SDKLogData from "../external/IC3Client/IIC3SDKLogData";
import IOCSDKLogData from "../external/OCSDK/IOCSDKLogData";
import AriaTelemetry from "../telemetry/AriaTelemetry";
import ScenarioType from "../telemetry/ScenarioType";

export class IC3ClientLogger {
    private debug = false;
    private requestId = '';
    private chatId = '';
    private telemetry: typeof AriaTelemetry | null = null;

    constructor(private omnichannelConfig: IOmnichannelConfig) {
        this.debug = false;
    }

    /* istanbul ignore next */
    public setDebug(flag: boolean): void {
        this.debug = flag;
    }

    public setRequestId(requestId: string): void {
        this.requestId = requestId;
    }

    public setChatId(chatId: string): void {
        this.chatId = chatId;
    }

    public useTelemetry(telemetry: typeof AriaTelemetry): void {
        this.debug && console.log(`[IC3ClientLogger][useTelemetry]`);
        this.telemetry = telemetry;
    }

    public logClientSdkTelemetryEvent(logLevel: LogLevel, event: IIC3SDKLogData): void {
        this.debug && console.log(`[IC3ClientLogger][logClientSdkTelemetryEvent][${logLevel}]`);
        this.debug && console.log(event);

        const baseProperties: AWTEventData["properties"] = {
            OrgId: this.omnichannelConfig.orgId,
            OrgUrl: this.omnichannelConfig.orgUrl,
            WidgetId: this.omnichannelConfig.widgetId,
            RequestId: this.requestId,
            ChatId: this.chatId
        };

        const additionalProperties: AWTEventData["properties"] = {
            ...event,
            ExceptionDetails: event.ExceptionDetails? JSON.stringify(event.ExceptionDetails): '',
        };

        switch(logLevel) {
            case LogLevel.DEBUG:
                this.telemetry?.debug({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.IC3CLIENT);
                break;
            case LogLevel.WARN:
                this.telemetry?.warn({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.IC3CLIENT);
                break;
            case LogLevel.ERROR:
                this.telemetry?.error({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.IC3CLIENT);
                break;
            case LogLevel.INFO:
            default:
                this.telemetry?.info({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.IC3CLIENT);
                break;
        }
    }
}

export class OCSDKLogger {
    private debug = false;
    private requestId = '';
    private chatId = '';
    private telemetry: typeof AriaTelemetry | null = null;

    constructor(private omnichannelConfig: IOmnichannelConfig) {
        this.debug = false;
    }

    /* istanbul ignore next */
    public setDebug(flag: boolean): void {
        this.debug = flag;
    }

    public setRequestId(requestId: string): void {
        this.requestId = requestId;
    }

    public setChatId(chatId: string): void {
        this.chatId = chatId;
    }

    public useTelemetry(telemetry: typeof AriaTelemetry): void {
        this.debug && console.log(`[OCSDKLogger][useTelemetry]`);
        this.telemetry = telemetry;
    }

    public logClientSdkTelemetryEvent(logLevel: LogLevel, event: IOCSDKLogData): void {
        this.debug && console.log(`[OCSDKLogger][logClientSdkTelemetryEvent][${logLevel}]`);
        this.debug && console.log(event);

        const baseProperties: AWTEventData["properties"] = {
            OrgId: this.omnichannelConfig.orgId,
            OrgUrl: this.omnichannelConfig.orgUrl,
            WidgetId: this.omnichannelConfig.widgetId,
            RequestId: this.requestId,
            ChatId: this.chatId
        };

        const additionalProperties: AWTEventData["properties"] = {
            ...event,
            ExceptionDetails: event.ExceptionDetails? JSON.stringify(event.ExceptionDetails): '',
        };

        switch(logLevel) {
            case LogLevel.DEBUG:
                this.telemetry?.debug({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.OCSDK);
                break;
            case LogLevel.WARN:
                this.telemetry?.warn({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.OCSDK);
                break;
            case LogLevel.ERROR:
                this.telemetry?.error({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.OCSDK);
                break;
            case LogLevel.INFO:
            default:
                this.telemetry?.info({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.OCSDK);
                break;
        }
    }
}

export const createIC3ClientLogger = (omnichannelConfig: IOmnichannelConfig, debug = false): IC3ClientLogger => {
    const logger = new IC3ClientLogger(omnichannelConfig);
    logger.setDebug(debug);
    return logger;
}

export const createOCSDKLogger = (omnichannelConfig: IOmnichannelConfig, debug = false): OCSDKLogger => {
    const logger = new OCSDKLogger(omnichannelConfig);
    logger.setDebug(debug);
    return logger;
}