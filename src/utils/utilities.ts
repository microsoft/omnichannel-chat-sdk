import MessageType from "@microsoft/omnichannel-ic3core/lib/model/MessageType";

export const isSystemMessage = (message: any): boolean => { // eslint-disable-line @typescript-eslint/no-explicit-any,  @typescript-eslint/explicit-module-boundary-types
    const {messageType, properties} = message;
    return (messageType === MessageType.UserMessage)
    && (properties.tags.includes("system"));
}

export const isCustomerMessage = (message: any): boolean => { // eslint-disable-line @typescript-eslint/no-explicit-any,  @typescript-eslint/explicit-module-boundary-types
    const {sender} = message;
    return (sender.id.includes('contacts/8:'));
}