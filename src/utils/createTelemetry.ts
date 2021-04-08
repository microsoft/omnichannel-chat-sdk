import AriaTelemetry from "../telemetry/AriaTelemetry";

const createTelemetry = (debug = false): typeof AriaTelemetry => {
    AriaTelemetry.setDebug(debug);
    return AriaTelemetry;
};

export default createTelemetry;