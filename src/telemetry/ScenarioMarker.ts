import IOmnichannelConfig from "../core/IOmnichannelConfig";
import { AWTEventData } from "../external/aria/webjs/AriaSDK";
import IChatToken from "../external/IC3Adapter/IChatToken";
import AriaTelemetry from "./AriaTelemetry";
import StopWatch from "./StopWatch";
import TelemetryEvent, {startEvent, failEvent, completeEvent} from "./TelemetryEvent";

class ScenarioMarker {
    private debug: boolean;
    private telemetryEvents: Map<string, StopWatch>;
    private telemetry: typeof AriaTelemetry | null = null;

    constructor(private omnichannelConfig: IOmnichannelConfig) {
        this.debug = false;
        this.telemetryEvents = new Map();
    }

    /* istanbul ignore next */
    public setDebug(flag: boolean): void {
        this.debug = flag;
        this.telemetry?.setDebug(flag);
    }

    public useTelemetry(telemetry: typeof AriaTelemetry) {
        this.debug && console.log(`[ScenarioMarker][useTelemetry]`);
        this.telemetry = telemetry;
    };

    public startScenario(event: TelemetryEvent, additionalProperties: AWTEventData["properties"] = {}) {
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

    public failScenario(event: TelemetryEvent, additionalProperties: AWTEventData["properties"] = {}) {
        this.debug && console.log(`[ScenarioMarker][failScenario]`);

        const stopWatch = this.telemetryEvents.get(event);
        this.telemetryEvents.delete(event);

        const properties = {
            Event: failEvent(event),
            OrgId: this.omnichannelConfig.orgId,
            OrgUrl: this.omnichannelConfig.orgUrl,
            WidgetId: this.omnichannelConfig.widgetId,
            ElapsedTimeInMilliseconds: stopWatch!.stop(),
            ...additionalProperties
        };

        this.telemetry?.error(properties);
    }

    public completeScenario(event: TelemetryEvent, additionalProperties: AWTEventData["properties"] = {}) {
        this.debug && console.log(`[ScenarioMarker][completeScenario]`);

        const stopWatch = this.telemetryEvents.get(event);
        this.telemetryEvents.delete(event);

        const properties = {
            Event: completeEvent(event),
            OrgId: this.omnichannelConfig.orgId,
            OrgUrl: this.omnichannelConfig.orgUrl,
            WidgetId: this.omnichannelConfig.widgetId,
            ElapsedTimeInMilliseconds: stopWatch!.stop(),
            ...additionalProperties
        };

        this.telemetry?.info(properties);
    }
}

export default ScenarioMarker;