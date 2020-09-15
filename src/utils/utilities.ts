import MessageType from "@microsoft/omnichannel-ic3core/lib/model/MessageType";

export const isSystemMessage = (message: any) => {
    const {messageType, properties} = message;
    return (messageType === MessageType.UserMessage)
    && (properties.tags.includes("system"));
}

export const isCustomerMessage = (message: any) => {
    const {sender} = message;
    return (sender.id.includes('contacts/8:'));
}