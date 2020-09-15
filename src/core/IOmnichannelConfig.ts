import IOmnichannelConfiguration from "@microsoft/ocsdk/lib/Interfaces/IOmnichannelConfiguration";

export default interface IOmnichannelConfig {
    orgId: string;
    orgUrl: string;
    widgetId: string;
}