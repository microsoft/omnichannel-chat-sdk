import AriaTelemetry from "../telemetry/AriaTelemetry";
import { ACSAdapterLogger, ACSClientLogger, AMSClientLogger, CallingSDKLogger, IC3ClientLogger, OCSDKLogger } from "./loggers";
import { isJsonObject } from "./utilities";

export const _basePIIKeys = [
    "senderDisplayName",
    "message",
    "content",
    "fileName"
]
    .map(s => s.toLowerCase());

export const _exceptionDetailPIIKeys = [..._basePIIKeys, "authorization"];
const disallowedStrValues: string[] = [];

export const useTelemetry = (telemetry: typeof AriaTelemetry, ocSdkLogger: OCSDKLogger, acsClientLogger: ACSClientLogger, acsAdapterLogger: ACSAdapterLogger, callingSdkLogger: CallingSDKLogger, amsClientLogger: AMSClientLogger, ic3ClientLogger: IC3ClientLogger | null = null): void => {
    ocSdkLogger.useTelemetry(telemetry);
    acsClientLogger.useTelemetry(telemetry);
    acsAdapterLogger.useTelemetry(telemetry);
    callingSdkLogger.useTelemetry(telemetry);
    amsClientLogger.useTelemetry(telemetry);
    ic3ClientLogger?.useTelemetry(telemetry);
}

export const setRuntimeId = (runtimeId: string, ocSdkLogger: OCSDKLogger, acsClientLogger: ACSClientLogger, acsAdapterLogger: ACSAdapterLogger, callingSdkLogger: CallingSDKLogger, amsClientLogger: AMSClientLogger, ic3ClientLogger: IC3ClientLogger | null = null): void => {
    ocSdkLogger.setRuntimeId(runtimeId);
    acsClientLogger.setRuntimeId(runtimeId);
    acsAdapterLogger.setRuntimeId(runtimeId);
    callingSdkLogger.setRuntimeId(runtimeId);
    amsClientLogger.setRuntimeId(runtimeId);
    ic3ClientLogger?.setRuntimeId(runtimeId);
}

export const setRequestId = (requestId: string, ocSdkLogger?: OCSDKLogger | null, acsClientLogger?: ACSClientLogger | null, acsAdapterLogger?: ACSAdapterLogger | null, callingSdkLogger?: CallingSDKLogger | null, amsClientLogger?: AMSClientLogger | null, ic3ClientLogger: IC3ClientLogger | null = null): void => {
    ocSdkLogger?.setRequestId(requestId);
    acsClientLogger?.setRequestId(requestId);
    acsAdapterLogger?.setRequestId(requestId);
    callingSdkLogger?.setRequestId(requestId);
    amsClientLogger?.setRequestId(requestId);
    ic3ClientLogger?.setRequestId(requestId);
}

export const setDebug = (flag: boolean, ocSdkLogger?: OCSDKLogger | null, acsClientLogger?: ACSClientLogger | null, acsAdapterLogger?: ACSAdapterLogger | null, callingSdkLogger?: CallingSDKLogger | null, amsClientLogger?: AMSClientLogger | null, ic3ClientLogger: IC3ClientLogger | null = null): void => {
    ocSdkLogger?.setDebug(flag);
    acsClientLogger?.setDebug(flag);
    acsAdapterLogger?.setDebug(flag);
    callingSdkLogger?.setDebug(flag);
    amsClientLogger?.setDebug(flag);
    ic3ClientLogger?.setDebug(flag);
}

export const setChatId = (chatId: string, ocSdkLogger?: OCSDKLogger | null, acsClientLogger?: ACSClientLogger | null, acsAdapterLogger?: ACSAdapterLogger | null, callingSdkLogger?: CallingSDKLogger | null, amsClientLogger?: AMSClientLogger | null, ic3ClientLogger: IC3ClientLogger | null = null): void => {
    ocSdkLogger?.setChatId(chatId);
    acsClientLogger?.setChatId(chatId);
    acsAdapterLogger?.setChatId(chatId);
    callingSdkLogger?.setChatId(chatId);
    amsClientLogger?.setChatId(chatId);
    ic3ClientLogger?.setChatId(chatId);
}

function containsDisallowedValues(targetValue: string) {
    for (const disallowedValue of disallowedStrValues) {
        if (targetValue.toLowerCase().includes(disallowedValue.toLowerCase())) {
            return disallowedValue;
        }
    }
    return undefined;
}

export function redactPII(input: unknown, redactAllNested = false, shouldClone = true, knownPIIKeys = _basePIIKeys): unknown {
    if (input === undefined || input === null) {
        return input;
    }
    if (typeof input == "boolean") {
        return { result: input };
    }
    // If stringified JSON, parse it first
    if (typeof input == "string") {
        if (isJsonObject(input)) {
            input = JSON.parse(input);
        } else {
            const disallowedValue = containsDisallowedValues(input);
            if (disallowedValue) {
                if (input.length > 1) {
                    input = `${disallowedValue}:${input.slice(0, 1)}**${input.length - 1} hidden**`;
                }
            }
        }
    }
    if (input && typeof input == "object") {
        try {
            // Deep clone the object so we don't modify the original object
            // Using JSON.parse(JSON.stringify()) since we know this object will need to be stringified,
            // so if clone operation fails, then sending telemetry would fail anyways
            let cloned: { [key: string]: any };
            if (shouldClone) {
                cloned = JSON.parse(JSON.stringify(input));
            } else {
                cloned = input;
            }

            for (const [key,value] of Object.entries(cloned)) {
                // Convert all keys to lower case to simplify matching
                const keyLowerCase = key.toLowerCase();

                if (redactAllNested || knownPIIKeys.includes(keyLowerCase)) {
                    // Found a PII key, redact it. Not currently considering UUID, or number types as PII
                    // Any key that contains "token" is considered PII
                    if (typeof value == "string") {
                        // Even if it is a string, it could be a JSON string, so we need to check that first
                        if (isJsonObject(value)) {
                            cloned[key] = redactPII(JSON.parse(value), true, false, knownPIIKeys);
                        } else {
                            if (value.length > 1) {
                                cloned[key] = value.slice(0, 1) + `**${value.length - 1} hidden**`;
                            }
                        }
                    } else if (typeof value == "object") {
                        // Found a PII key, but it contains an object, redact all nested keys instead
                        redactPII(value, true, false, knownPIIKeys);
                    }
                } else if (typeof value == "object") {
                    redactPII(value, redactAllNested, false, knownPIIKeys);
                } else if (typeof value === "string") {
                    if (isJsonObject(value)) {
                        // Check and redact stringified objects that are not under a known PII key
                        cloned[key] = redactPII(JSON.parse(value), redactAllNested, false, knownPIIKeys);
                    } else {
                        // if the key or value contains the disallowed values, redact the payload
                        const disallowedValue = containsDisallowedValues(value);
                        if (disallowedValue) {
                            if (value.length > 1) {
                                cloned[key] = `${key}:${disallowedValue}:`
                                + value.slice(0, 1) + `**${value.length - 1} hidden**`;
                            }
                        }
                    }
                }
            }

            return cloned;
        } catch (parseError) {
            // Can't guarantee that an object which can't be parsed doesn't contain PII, so instead we return the parse error
            return { error: parseError, keys: Object.keys(input) };
        }
    }

    // Expect input to be an object, if it's not, return it as-is
    return input;
}

export default {
    useTelemetry,
    setRuntimeId,
    setRequestId,
    setDebug,
    setChatId,
    redactPII
}