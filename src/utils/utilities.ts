import ACSParticipantDisplayName from "../core/messaging/ACSParticipantDisplayName";
import MessageType from "@microsoft/omnichannel-ic3core/lib/model/MessageType";
import { uuidv4 } from "@microsoft/ocsdk";
import { Role } from "../core/messaging/OmnichannelMessage";

export const isSystemMessage = (message: any): boolean => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const {messageType, properties} = message;

    const conditionV1 = messageType === MessageType.UserMessage
    && properties
    && properties.tags
    && properties.tags.includes("system");

    const conditionV2 = message.tags && message.tags.includes("system");
    return conditionV1 || conditionV2 || false;
}

export const isCustomerMessage = (message: any): boolean => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const {sender} = message;

    const conditionV1 = sender && sender.id && sender.id.includes('contacts/8:');
    const conditionV2 = sender && sender.displayName && sender.displayName === ACSParticipantDisplayName.Customer;

    return conditionV1 || conditionV2 || false;
}

export const getMessageRole = (message: any): string => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { messageType, properties, tags } = message;

    const isBotMessage = (messageType === MessageType.UserMessage && (!properties.tags || Object.keys(properties.tags).length === 0)) &&
        (tags && tags.length === 0);

    const isAgentMessage = (messageType === MessageType.UserMessage && properties?.tags?.includes("public")) ||
        (tags && tags.includes("public"));

    if (isBotMessage) return Role.Bot;
    if (isAgentMessage) return Role.Agent;
    if (isSystemMessage(message)) return Role.System;
    if (isCustomerMessage(message)) return Role.User;
    return Role.Unknown;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isClientIdNotFoundErrorMessage = (e: any): boolean => {
    return e?.response?.status === 401
        && e?.response?.headers?.message === "UserId not found";
}

export const isNotEmpty = (value: string | null) : boolean => {
    return value !== null && value !== undefined && value.trim() !== '';
}

export const getRuntimeId = (externalRuntimeId : string | null ): string => {
    if (externalRuntimeId !== null && isNotEmpty(externalRuntimeId)) {
        return externalRuntimeId;
    }
    return uuidv4();
}

export const isJsonObject = (input: string) => {
    try {
        JSON.parse(input);
        return true;
    } catch {
        return false;
    }
}

export const messageContentMetadata = (message: string): string => {
    if (!message || message.length === 0) {
        // If the message is empty or null, return '0'
        return '0';
    }
    const first = message?.charAt(0);
    const last = message?.charAt(message?.length - 1);
    const size = message?.length;
    return `${first}${size}${last}`;
}

