import LogLevel from "../telemetry/LogLevel";
import OmnichannelConfig from "../core/OmnichannelConfig";
import { AWTEventData } from "../external/aria/webjs/AriaSDK";
import ICallingSDKLogData from "../external/CallingSDK/ICallingSDKLogData";
import IIC3SDKLogData from "../external/IC3Client/IIC3SDKLogData";
import IOCSDKLogData from "../external/OCSDK/IOCSDKLogData";
import AriaTelemetry from "../telemetry/AriaTelemetry";
import ScenarioType from "../telemetry/ScenarioType";
import ScenarioMarker from "../telemetry/ScenarioMarker";

export class IC3ClientLogger {
    private debug = false;
    private runtimeId = '';
    private requestId = '';
    private chatId = '';
    private telemetry: typeof AriaTelemetry | null = null;

    constructor(private omnichannelConfig: OmnichannelConfig) {
        this.debug = false;
    }

    /* istanbul ignore next */
    public setDebug(flag: boolean): void {
        this.debug = flag;
    }

    public setRuntimeId(runtimeId: string): void {
        this.runtimeId = runtimeId;
    }

    public setRequestId(requestId: string): void {
        this.requestId = requestId;
    }

    public setChatId(chatId: string): void {
        this.chatId = chatId;
    }

    public useTelemetry(telemetry: typeof AriaTelemetry): void {
        /* istanbul ignore next */
        this.debug && console.log(`[IC3ClientLogger][useTelemetry]`);
        this.telemetry = telemetry;
    }

    public logClientSdkTelemetryEvent(logLevel: LogLevel, event: IIC3SDKLogData): void {
        /* istanbul ignore next */
        this.debug && console.log(`[IC3ClientLogger][logClientSdkTelemetryEvent][${logLevel}]`);
        /* istanbul ignore next */
        this.debug && console.log(event);

        const baseProperties: AWTEventData["properties"] = {
            ChatSDKRuntimeId: this.runtimeId,
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
    private runtimeId = '';
    private requestId = '';
    private chatId = '';
    private telemetry: typeof AriaTelemetry | null = null;

    constructor(private omnichannelConfig: OmnichannelConfig) {
        this.debug = false;
    }

    /* istanbul ignore next */
    public setDebug(flag: boolean): void {
        this.debug = flag;
    }

    public setRuntimeId(runtimeId: string): void {
        this.runtimeId = runtimeId;
    }

    public setRequestId(requestId: string): void {
        this.requestId = requestId;
    }

    public setChatId(chatId: string): void {
        this.chatId = chatId;
    }

    public useTelemetry(telemetry: typeof AriaTelemetry): void {
        /* istanbul ignore next */
        this.debug && console.log(`[OCSDKLogger][useTelemetry]`);
        this.telemetry = telemetry;
    }

    public logClientSdkTelemetryEvent(logLevel: LogLevel, event: IOCSDKLogData): void {
        /* istanbul ignore next */
        this.debug && console.log(`[OCSDKLogger][logClientSdkTelemetryEvent][${logLevel}]`);
        /* istanbul ignore next */
        this.debug && console.log(event);

        const baseProperties: AWTEventData["properties"] = {
            ChatSDKRuntimeId: this.runtimeId,
            OrgId: this.omnichannelConfig.orgId,
            OrgUrl: this.omnichannelConfig.orgUrl,
            WidgetId: this.omnichannelConfig.widgetId,
            RequestId: this.requestId,
            ChatId: this.chatId
        };

        const additionalProperties: AWTEventData["properties"] = {
            ...event,
            RequestHeaders: event.RequestHeaders? JSON.stringify(event.RequestHeaders): '',
            RequestPayload: event.RequestPayload? JSON.stringify(event.RequestPayload): '',
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

export class ACSClientLogger {
    private debug = false;
    private runtimeId = '';
    private requestId = '';
    private chatId = '';
    private telemetry: typeof AriaTelemetry | null = null;
    private scenarioMarker: ScenarioMarker | null = null;

    constructor(private omnichannelConfig: OmnichannelConfig) {
        this.debug = false;
        this.scenarioMarker = new ScenarioMarker(omnichannelConfig);
        this.scenarioMarker.setScenarioType(ScenarioType.ACSCLIENT);
    }

    /* istanbul ignore next */
    public setDebug(flag: boolean): void {
        this.debug = flag;
        this.scenarioMarker?.setDebug(flag);
    }

    public setRuntimeId(runtimeId: string): void {
        this.runtimeId = runtimeId;
        this.scenarioMarker?.setRuntimeId(runtimeId);
    }

    public setRequestId(requestId: string): void {
        this.requestId = requestId;
    }

    public setChatId(chatId: string): void {
        this.chatId = chatId;
    }

    public useTelemetry(telemetry: typeof AriaTelemetry): void {
        /* istanbul ignore next */
        this.debug && console.log(`[ACSClientLogger][useTelemetry]`);
        this.telemetry = telemetry;
        this.scenarioMarker?.useTelemetry(this.telemetry);
    }

    public logClientSdkTelemetryEvent(logLevel: LogLevel, event: any): void {  // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        /* istanbul ignore next */
        this.debug && console.log(`[ACSClientLogger][logClientSdkTelemetryEvent][${logLevel}]`);
        /* istanbul ignore next */
        this.debug && console.log(event);

        const baseProperties: AWTEventData["properties"] = {
            ChatSDKRuntimeId: this.runtimeId,
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
                }, ScenarioType.ACSCLIENT);
                break;
            case LogLevel.WARN:
                this.telemetry?.warn({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.ACSCLIENT);
                break;
            case LogLevel.ERROR:
                this.telemetry?.error({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.ACSCLIENT);
                break;
            case LogLevel.INFO:
            default:
                this.telemetry?.info({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.ACSCLIENT);
                break;
        }
    }

    public startScenario(event: string, additionalProperties: any = {}): void {  // eslint-disable-line @typescript-eslint/no-explicit-any
        const baseProperties = {
            RequestId: this.requestId,
            ChatId: this.chatId
        };

        this.scenarioMarker?.startScenario(event, {...baseProperties, ...additionalProperties});
    }

    public failScenario(event: string, additionalProperties: any = {}): void {  // eslint-disable-line @typescript-eslint/no-explicit-any
        const baseProperties = {
            RequestId: this.requestId,
            ChatId: this.chatId
        };

        this.scenarioMarker?.failScenario(event, {...baseProperties, ...additionalProperties});
    }

    public completeScenario(event: string, additionalProperties: any = {}): void {  // eslint-disable-line @typescript-eslint/no-explicit-any
        const baseProperties = {
            RequestId: this.requestId,
            ChatId: this.chatId
        };

        this.scenarioMarker?.completeScenario(event, {...baseProperties, ...additionalProperties});
    }
}

export class ACSAdapterLogger {
    private debug = false;
    private runtimeId = '';
    private requestId = '';
    private chatId = '';
    private telemetry: typeof AriaTelemetry | null = null;
    private scenarioMarker: ScenarioMarker | null = null;

    constructor(private omnichannelConfig: OmnichannelConfig) {
        this.debug = false;
        this.scenarioMarker = new ScenarioMarker(omnichannelConfig);
        this.scenarioMarker.setScenarioType(ScenarioType.ACSADAPTER);
    }

    /* istanbul ignore next */
    public setDebug(flag: boolean): void {
        this.debug = flag;
        this.scenarioMarker?.setDebug(flag);
    }

    public setRuntimeId(runtimeId: string): void {
        this.runtimeId = runtimeId;
        this.scenarioMarker?.setRuntimeId(this.runtimeId);
    }

    public setRequestId(requestId: string): void {
        this.requestId = requestId;
    }

    public setChatId(chatId: string): void {
        this.chatId = chatId;
    }

    public useTelemetry(telemetry: typeof AriaTelemetry): void {
        /* istanbul ignore next */
        this.debug && console.log(`[ACSAdapterLogger][useTelemetry]`);
        this.telemetry = telemetry;
        this.scenarioMarker?.useTelemetry(this.telemetry);
    }

    public logEvent(logLevel: LogLevel, event: any): void {  // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        /* istanbul ignore next */
        this.debug && console.log(`[ACSAdapterLogger][logClientSdkTelemetryEvent][${logLevel}]`);
        /* istanbul ignore next */
        this.debug && console.log(event);

        const baseProperties: AWTEventData["properties"] = {
            ChatSDKRuntimeId: this.runtimeId,
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
                }, ScenarioType.ACSADAPTER);
                break;
            case LogLevel.WARN:
                this.telemetry?.warn({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.ACSADAPTER);
                break;
            case LogLevel.ERROR:
                this.telemetry?.error({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.ACSADAPTER);
                break;
            case LogLevel.INFO:
            default:
                this.telemetry?.info({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.ACSADAPTER);
                break;
        }
    }

    public startScenario(event: string, additionalProperties: any = {}): void {  // eslint-disable-line @typescript-eslint/no-explicit-any
        const baseProperties = {
            RequestId: this.requestId,
            ChatId: this.chatId
        };

        this.scenarioMarker?.startScenario(event, {...baseProperties, ...additionalProperties});
    }

    public failScenario(event: string, additionalProperties: any = {}): void {  // eslint-disable-line @typescript-eslint/no-explicit-any
        const baseProperties = {
            RequestId: this.requestId,
            ChatId: this.chatId
        };

        this.scenarioMarker?.failScenario(event, {...baseProperties, ...additionalProperties});
    }

    public completeScenario(event: string, additionalProperties: any = {}): void {  // eslint-disable-line @typescript-eslint/no-explicit-any
        const baseProperties = {
            RequestId: this.requestId,
            ChatId: this.chatId
        };

        this.scenarioMarker?.completeScenario(event, {...baseProperties, ...additionalProperties});
    }
}

export class CallingSDKLogger {
    private debug = false;
    private runtimeId = '';
    private requestId = '';
    private chatId = '';
    private telemetry: typeof AriaTelemetry | null = null;

    constructor(private omnichannelConfig: OmnichannelConfig) {
        this.debug = false;
    }

    /* istanbul ignore next */
    public setDebug(flag: boolean): void {
        this.debug = flag;
    }

    public setRuntimeId(runtimeId: string): void {
        this.runtimeId = runtimeId;
    }

    public setRequestId(requestId: string): void {
        this.requestId = requestId;
    }

    public setChatId(chatId: string): void {
        this.chatId = chatId;
    }

    public useTelemetry(telemetry: typeof AriaTelemetry): void {
        /* istanbul ignore next */
        this.debug && console.log(`[CallingSDKLogger][useTelemetry]`);
        this.telemetry = telemetry;
    }

    public logScenarioOperation(operationName: string, startTime: number, endTime: number, isSuccess: boolean, retryCount: number, data?: object): void { // eslint-disable-line @typescript-eslint/no-unused-vars
        // empty on purpose.
        return;
    }

    public logCallingSdkTelemetryEvent(logLevel: LogLevel, event: ICallingSDKLogData): void {
        /* istanbul ignore next */
        this.debug && console.log(`[CallingSDKLogger][logClientSdkTelemetryEvent][${logLevel}]`);
        /* istanbul ignore next */
        this.debug && console.log(event);

        const baseProperties: AWTEventData["properties"] = {
            ChatSDKRuntimeId: this.runtimeId,
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
                }, ScenarioType.CALLINGSDK);
                break;
            case LogLevel.WARN:
                this.telemetry?.warn({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.CALLINGSDK);
                break;
            case LogLevel.ERROR:
                this.telemetry?.error({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.CALLINGSDK);
                break;
            case LogLevel.INFO:
            default:
                this.telemetry?.info({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.CALLINGSDK);
                break;
        }
    }
}

export class AMSClientLogger {
    private debug = false;
    private runtimeId = '';
    private requestId = '';
    private chatId = '';
    private telemetry: typeof AriaTelemetry | null = null;

    constructor(private omnichannelConfig: OmnichannelConfig) {
        this.debug = false;
    }

    /* istanbul ignore next */
    public setDebug(flag: boolean): void {
        this.debug = flag;
    }

    public setRuntimeId(runtimeId: string): void {
        this.runtimeId = runtimeId;
    }

    public setRequestId(requestId: string): void {
        this.requestId = requestId;
    }

    public setChatId(chatId: string): void {
        this.chatId = chatId;
    }

    public useTelemetry(telemetry: typeof AriaTelemetry): void {
        /* istanbul ignore next */
        this.debug && console.log(`[AMSClientLogger][useTelemetry]`);
        this.telemetry = telemetry;
    }

    public logClientSdkTelemetryEvent(logLevel: LogLevel, event: any): void {  // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        /* istanbul ignore next */
        this.debug && console.log(`[AMSClientLogger][logClientSdkTelemetryEvent][${logLevel}]`);
        /* istanbul ignore next */
        this.debug && console.log(event);

        const baseProperties: AWTEventData["properties"] = {
            ChatSDKRuntimeId: this.runtimeId,
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
                }, ScenarioType.AMSCLIENT);
                break;
            case LogLevel.WARN:
                this.telemetry?.warn({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.AMSCLIENT);
                break;
            case LogLevel.ERROR:
                this.telemetry?.error({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.AMSCLIENT);
                break;
            case LogLevel.INFO:
            default:
                this.telemetry?.info({
                    ...baseProperties,
                    ...additionalProperties
                }, ScenarioType.AMSCLIENT);
                break;
        }
    }
}

export const createIC3ClientLogger = (omnichannelConfig: OmnichannelConfig, debug = false): IC3ClientLogger => {
    const logger = new IC3ClientLogger(omnichannelConfig);
    logger.setDebug(debug);
    return logger;
}

export const createOCSDKLogger = (omnichannelConfig: OmnichannelConfig, debug = false): OCSDKLogger => {
    const logger = new OCSDKLogger(omnichannelConfig);
    logger.setDebug(debug);
    return logger;
}

export const createACSClientLogger = (omnichannelConfig: OmnichannelConfig, debug = false): ACSClientLogger => {
    const logger = new ACSClientLogger(omnichannelConfig);
    logger.setDebug(debug);
    return logger;
}

export const createACSAdapterLogger = (omnichannelConfig: OmnichannelConfig, debug = false): ACSAdapterLogger => {
    const logger = new ACSAdapterLogger(omnichannelConfig);
    logger.setDebug(debug);
    return logger;
}

export const createCallingSDKLogger = (omnichannelConfig: OmnichannelConfig, debug = false): CallingSDKLogger => {
    const logger = new CallingSDKLogger(omnichannelConfig);
    logger.setDebug(debug);
    return logger;
}

export const createAMSClientLogger = (omnichannelConfig: OmnichannelConfig, debug = false): AMSClientLogger => {
    const logger = new AMSClientLogger(omnichannelConfig);
    logger.setDebug(debug);
    return logger;
}
