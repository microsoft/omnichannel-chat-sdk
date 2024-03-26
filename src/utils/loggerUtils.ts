import AriaTelemetry from "../telemetry/AriaTelemetry";
import { ACSAdapterLogger, ACSClientLogger, AMSClientLogger, CallingSDKLogger, IC3ClientLogger, OCSDKLogger } from "./loggers";

export const useTelemetry = (telemetry: typeof AriaTelemetry, ocSdkLogger: OCSDKLogger, acsClientLogger: ACSClientLogger, acsAdapterLogger: ACSAdapterLogger, callingSdkLogger: CallingSDKLogger, amsClientLogger: AMSClientLogger, ic3ClientLogger: IC3ClientLogger | undefined = undefined) => {
    ocSdkLogger.useTelemetry(telemetry);
    acsClientLogger.useTelemetry(telemetry);
    acsAdapterLogger.useTelemetry(telemetry);
    callingSdkLogger.useTelemetry(telemetry);
    amsClientLogger.useTelemetry(telemetry);
    ic3ClientLogger?.useTelemetry(telemetry);
}

export const setRuntimeId = (runtimeId: string, ocSdkLogger: OCSDKLogger, acsClientLogger: ACSClientLogger, acsAdapterLogger: ACSAdapterLogger, callingSdkLogger: CallingSDKLogger, amsClientLogger: AMSClientLogger, ic3ClientLogger: IC3ClientLogger | undefined = undefined) => {
    ocSdkLogger.setRuntimeId(runtimeId);
    acsClientLogger.setRuntimeId(runtimeId);
    acsAdapterLogger.setRuntimeId(runtimeId);
    callingSdkLogger.setRuntimeId(runtimeId);
    amsClientLogger.setRuntimeId(runtimeId);
    ic3ClientLogger?.setRuntimeId(runtimeId);
}

export const setRequestId = (requestId: string, ocSdkLogger: OCSDKLogger, acsClientLogger: ACSClientLogger, acsAdapterLogger: ACSAdapterLogger, callingSdkLogger: CallingSDKLogger, amsClientLogger: AMSClientLogger, ic3ClientLogger: IC3ClientLogger | undefined = undefined) => {
    ocSdkLogger.setRequestId(requestId);
    acsClientLogger.setRequestId(requestId);
    acsAdapterLogger.setRequestId(requestId);
    callingSdkLogger.setRequestId(requestId);
    amsClientLogger.setRequestId(requestId);
    ic3ClientLogger?.setRequestId(requestId);
}

export default {
    useTelemetry,
    setRuntimeId,
    setRequestId
}