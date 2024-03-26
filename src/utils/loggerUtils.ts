import AriaTelemetry from "../telemetry/AriaTelemetry";
import { ACSAdapterLogger, ACSClientLogger, AMSClientLogger, CallingSDKLogger, IC3ClientLogger, OCSDKLogger } from "./loggers";

export const useTelemetry = (telemetry: typeof AriaTelemetry, ocSdkLogger: OCSDKLogger, acsClientLogger: ACSClientLogger, acsAdapterLogger: ACSAdapterLogger, callingSdkLogger: CallingSDKLogger, amsClientLogger: AMSClientLogger, ic3ClientLogger: IC3ClientLogger | null = null) => {
    ocSdkLogger.useTelemetry(telemetry);
    acsClientLogger.useTelemetry(telemetry);
    acsAdapterLogger.useTelemetry(telemetry);
    callingSdkLogger.useTelemetry(telemetry);
    amsClientLogger.useTelemetry(telemetry);
    ic3ClientLogger?.useTelemetry(telemetry);
}

export const setRuntimeId = (runtimeId: string, ocSdkLogger: OCSDKLogger, acsClientLogger: ACSClientLogger, acsAdapterLogger: ACSAdapterLogger, callingSdkLogger: CallingSDKLogger, amsClientLogger: AMSClientLogger, ic3ClientLogger: IC3ClientLogger | null = null) => {
    ocSdkLogger.setRuntimeId(runtimeId);
    acsClientLogger.setRuntimeId(runtimeId);
    acsAdapterLogger.setRuntimeId(runtimeId);
    callingSdkLogger.setRuntimeId(runtimeId);
    amsClientLogger.setRuntimeId(runtimeId);
    ic3ClientLogger?.setRuntimeId(runtimeId);
}

export const setRequestId = (requestId: string, ocSdkLogger: OCSDKLogger, acsClientLogger: ACSClientLogger, acsAdapterLogger: ACSAdapterLogger, callingSdkLogger: CallingSDKLogger, amsClientLogger: AMSClientLogger, ic3ClientLogger: IC3ClientLogger | null = null) => {
    ocSdkLogger.setRequestId(requestId);
    acsClientLogger.setRequestId(requestId);
    acsAdapterLogger.setRequestId(requestId);
    callingSdkLogger.setRequestId(requestId);
    amsClientLogger.setRequestId(requestId);
    ic3ClientLogger?.setRequestId(requestId);
}

export const setDebug = (flag: boolean, ocSdkLogger?: OCSDKLogger | null, acsClientLogger?: ACSClientLogger | null, acsAdapterLogger?: ACSAdapterLogger | null, callingSdkLogger?: CallingSDKLogger | null, amsClientLogger?: AMSClientLogger | null, ic3ClientLogger: IC3ClientLogger | null = null) => {
    ocSdkLogger?.setDebug(flag);
    acsClientLogger?.setDebug(flag);
    acsAdapterLogger?.setDebug(flag);
    callingSdkLogger?.setDebug(flag);
    amsClientLogger?.setDebug(flag);
    ic3ClientLogger?.setDebug(flag);
}

export default {
    useTelemetry,
    setRuntimeId,
    setRequestId,
    setDebug
}