import InitContext from "@microsoft/ocsdk/lib/Model/InitContext";

export default interface GetAgentAvailabilityOptionalParams {
    preChatResponse?: object;
    customContext?: object;
    browser?: string;
    os?: string;
    locale?: string;
    device?: string;
    initContext?: InitContext;
    reconnectId?: string;
    sendDefaultInitContext?: true;
    portalContactId?: string;
}