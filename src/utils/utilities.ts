import ACSParticipantDisplayName from "../core/messaging/ACSParticipantDisplayName";
import MessageType from "@microsoft/omnichannel-ic3core/lib/model/MessageType";
import { uuidv4 } from "@microsoft/ocsdk";

export const isSystemMessage = (message: any): boolean => { // eslint-disable-line @typescript-eslint/no-explicit-any,  @typescript-eslint/explicit-module-boundary-types
    const {messageType, properties} = message;

    const conditionV1 = messageType === MessageType.UserMessage
    && properties
    && properties.tags
    && properties.tags.includes("system");

    const conditionV2 = message.tags && message.tags.includes("system");
    return conditionV1 || conditionV2 || false;
}

export const isCustomerMessage = (message: any): boolean => { // eslint-disable-line @typescript-eslint/no-explicit-any,  @typescript-eslint/explicit-module-boundary-types
    const {sender} = message;

    const conditionV1 = sender && sender.id && sender.id.includes('contacts/8:');
    const conditionV2 = sender && sender.displayName && sender.displayName === ACSParticipantDisplayName.Customer;

    return conditionV1 || conditionV2 || false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
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
