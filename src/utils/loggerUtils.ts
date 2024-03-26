import AriaTelemetry from "../telemetry/AriaTelemetry";
import { ACSAdapterLogger, ACSClientLogger, AMSClientLogger, CallingSDKLogger, IC3ClientLogger, OCSDKLogger } from "./loggers";

export const useTelemetry = (telemetry: typeof AriaTelemetry, ocSdkLogger: OCSDKLogger, acsClientLogger: ACSClientLogger, acsAdapterLogger: ACSAdapterLogger, callingLogger: CallingSDKLogger, amsClientLogger: AMSClientLogger, ic3ClientLogger: IC3ClientLogger | undefined = undefined) => {
    ocSdkLogger.useTelemetry(telemetry);
    acsClientLogger.useTelemetry(telemetry);
    acsAdapterLogger.useTelemetry(telemetry);
    callingLogger.useTelemetry(telemetry);
    amsClientLogger.useTelemetry(telemetry);
    ic3ClientLogger?.useTelemetry(telemetry);
}

export default {
    useTelemetry
}