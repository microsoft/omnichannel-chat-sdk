import OmnichannelConfig from "../core/OmnichannelConfig";
import { AWTEventData } from "../external/aria/webjs/AriaSDK";
import AriaTelemetry from "./AriaTelemetry";
import StopWatch from "./StopWatch";
import {startEvent, failEvent, completeEvent} from './EventMarker';

class ScenarioMarker {
    private debug: boolean;
    private telemetryEvents: Map<string, StopWatch>;
    private telemetry: typeof AriaTelemetry | null = null;

    constructor(private omnichannelConfig: OmnichannelConfig) {
        this.debug = false;
        this.telemetryEvents = new Map();
    }

    /* istanbul ignore next */
    public setDebug(flag: boolean): void {
        this.debug = flag;
        this.telemetry?.setDebug(flag);
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
            Event: startEvent(event),
            OrgId: this.omnichannelConfig.orgId,
            OrgUrl: this.omnichannelConfig.orgUrl,
            WidgetId: this.omnichannelConfig.widgetId,
            ...additionalProperties
        };

        this.telemetry?.info(properties);
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
            Event: failEvent(event),
            OrgId: this.omnichannelConfig.orgId,
            OrgUrl: this.omnichannelConfig.orgUrl,
            WidgetId: this.omnichannelConfig.widgetId,
            ElapsedTimeInMilliseconds: stopWatch!.stop(), // eslint-disable-line @typescript-eslint/no-non-null-assertion
            ...additionalProperties
        };

        this.telemetry?.error(properties);
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
            Event: completeEvent(event),
            OrgId: this.omnichannelConfig.orgId,
            OrgUrl: this.omnichannelConfig.orgUrl,
            WidgetId: this.omnichannelConfig.widgetId,
            ElapsedTimeInMilliseconds: stopWatch!.stop(), // eslint-disable-line @typescript-eslint/no-non-null-assertion
            ...additionalProperties
        };

        this.telemetry?.info(properties);
    }
}

export default ScenarioMarker;