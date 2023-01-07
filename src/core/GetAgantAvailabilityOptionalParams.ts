import InitContext from "@microsoft/ocsdk/lib/Model/InitContext";

export default interface GetAgantAvailabilityOptionalParams {
    preChatResponse?: object;
    customContext?: object;
    browser?: string;
    os?: string;
    locale?: string;
    device?: string;
    initContext?: InitContext;
    reconnectId?: string;
    sendDefaultInitContext?: true;
}