import AriaTelemetry from "./AriaTelemetry";
import { AWTEventData } from "../external/aria/webjs/AriaSDK";
import OmnichannelConfig from "../core/OmnichannelConfig";
import ScenarioType from "./ScenarioType";
import StopWatch from "./StopWatch";
import {startEvent, failEvent, completeEvent} from './EventMarker';

class ScenarioMarker {
    private debug: boolean;
    private runtimeId = '';
    private telemetryEvents: Map<string, StopWatch>;
    private telemetry: typeof AriaTelemetry | null = null;
    private scenarioType: ScenarioType;

    constructor(private omnichannelConfig: OmnichannelConfig) {
        this.debug = false;
        this.telemetryEvents = new Map();
        this.scenarioType = ScenarioType.EVENTS;
    }

    /* istanbul ignore next */
    public setDebug(flag: boolean): void {
        this.debug = flag;
        this.telemetry?.setDebug(flag);
    }

    public setScenarioType(scenarioType: ScenarioType): void {
        this.scenarioType = scenarioType;
    }

    public setRuntimeId(runtimeId: string): void {
        this.runtimeId = runtimeId;
    }

    public useTelemetry(telemetry: typeof AriaTelemetry): void {
        this.debug && console.log(`[ScenarioMarker][useTelemetry]`);
        this.telemetry = telemetry;
    }

    public startScenario(event: string, additionalProperties: AWTEventData["properties"] = {}): void {
        this.debug && console.log(`[ScenarioMarker][startScenario]`);

        if (!this.telemetryEvents.has(event)) {
            const stopWatch = new StopWatch();
            stopWatch.start();
            this.telemetryEvents.set(event, stopWatch);
        }

        const properties = {
            ChatSDKRuntimeId: this.runtimeId,
            Event: startEvent(event),
            OrgId: this.omnichannelConfig.orgId,
            OrgUrl: this.omnichannelConfig.orgUrl,
            WidgetId: this.omnichannelConfig.widgetId,
            ...additionalProperties
        };

        this.telemetry?.info(properties, this.scenarioType);
    }

    public failScenario(event: string, additionalProperties: AWTEventData["properties"] = {}): void {
        this.debug && console.log(`[ScenarioMarker][failScenario]`);

        if (!this.telemetryEvents.has(event)) {
            console.warn(`'${event}' event has not started.`);
            return;
        }

        const stopWatch = this.telemetryEvents.get(event);
        this.telemetryEvents.delete(event);

        const properties = {
            ChatSDKRuntimeId: this.runtimeId,
            Event: failEvent(event),
            OrgId: this.omnichannelConfig.orgId,
            OrgUrl: this.omnichannelConfig.orgUrl,
            WidgetId: this.omnichannelConfig.widgetId,
            ElapsedTimeInMilliseconds: stopWatch!.stop(), // eslint-disable-line @typescript-eslint/no-non-null-assertion
            ...additionalProperties
        };

        this.telemetry?.error(properties, this.scenarioType);
    }

    public completeScenario(event: string, additionalProperties: AWTEventData["properties"] = {}): void {
        this.debug && console.log(`[ScenarioMarker][completeScenario]`);

        if (!this.telemetryEvents.has(event)) {
            console.warn(`'${event}' event has not started.`);
            return;
        }

        const stopWatch = this.telemetryEvents.get(event);
        this.telemetryEvents.delete(event);

        const properties = {
            ChatSDKRuntimeId: this.runtimeId,
            Event: completeEvent(event),
            OrgId: this.omnichannelConfig.orgId,
            OrgUrl: this.omnichannelConfig.orgUrl,
            WidgetId: this.omnichannelConfig.widgetId,
            ElapsedTimeInMilliseconds: stopWatch!.stop(), // eslint-disable-line @typescript-eslint/no-non-null-assertion
            ...additionalProperties
        };

        this.telemetry?.info(properties, this.scenarioType);
    }
}

export default ScenarioMarker;