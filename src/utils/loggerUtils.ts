import AriaTelemetry from "../telemetry/AriaTelemetry";
import { ACSAdapterLogger, ACSClientLogger, AMSClientLogger, CallingSDKLogger, OCSDKLogger } from "./loggers";

export const useTelemetry = (telemetry: typeof AriaTelemetry, ocSdkLogger: OCSDKLogger, acsClientLogger: ACSClientLogger, acsAdapterLogger: ACSAdapterLogger, callingSdkLogger: CallingSDKLogger, amsClientLogger: AMSClientLogger): void => {
    ocSdkLogger.useTelemetry(telemetry);
    acsClientLogger.useTelemetry(telemetry);
    acsAdapterLogger.useTelemetry(telemetry);
    callingSdkLogger.useTelemetry(telemetry);
    amsClientLogger.useTelemetry(telemetry);
}

export const setRuntimeId = (runtimeId: string, ocSdkLogger: OCSDKLogger, acsClientLogger: ACSClientLogger, acsAdapterLogger: ACSAdapterLogger, callingSdkLogger: CallingSDKLogger, amsClientLogger: AMSClientLogger): void => {
    ocSdkLogger.setRuntimeId(runtimeId);
    acsClientLogger.setRuntimeId(runtimeId);
    acsAdapterLogger.setRuntimeId(runtimeId);
    callingSdkLogger.setRuntimeId(runtimeId);
    amsClientLogger.setRuntimeId(runtimeId);
}

export const setRequestId = (requestId: string, ocSdkLogger?: OCSDKLogger | null, acsClientLogger?: ACSClientLogger | null, acsAdapterLogger?: ACSAdapterLogger | null, callingSdkLogger?: CallingSDKLogger | null, amsClientLogger?: AMSClientLogger | null): void => {
    ocSdkLogger?.setRequestId(requestId);
    acsClientLogger?.setRequestId(requestId);
    acsAdapterLogger?.setRequestId(requestId);
    callingSdkLogger?.setRequestId(requestId);
    amsClientLogger?.setRequestId(requestId);
}

export const setDebug = (flag: boolean, ocSdkLogger?: OCSDKLogger | null, acsClientLogger?: ACSClientLogger | null, acsAdapterLogger?: ACSAdapterLogger | null, callingSdkLogger?: CallingSDKLogger | null, amsClientLogger?: AMSClientLogger | null): void => {
    ocSdkLogger?.setDebug(flag);
    acsClientLogger?.setDebug(flag);
    acsAdapterLogger?.setDebug(flag);
    callingSdkLogger?.setDebug(flag);
    amsClientLogger?.setDebug(flag);
}

export const setChatId = (chatId: string, ocSdkLogger?: OCSDKLogger | null, acsClientLogger?: ACSClientLogger | null, acsAdapterLogger?: ACSAdapterLogger | null, callingSdkLogger?: CallingSDKLogger | null, amsClientLogger?: AMSClientLogger | null): void => {
    ocSdkLogger?.setChatId(chatId);
    acsClientLogger?.setChatId(chatId);
    acsAdapterLogger?.setChatId(chatId);
    callingSdkLogger?.setChatId(chatId);
    amsClientLogger?.setChatId(chatId);
}

export default {
    useTelemetry,
    setRuntimeId,
    setRequestId,
    setDebug,
    setChatId
}