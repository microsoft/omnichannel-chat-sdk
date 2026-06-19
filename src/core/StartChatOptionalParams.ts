import InitContext from "@microsoft/ocsdk/lib/Model/InitContext";
import LiveChatContext from "./LiveChatContext";

export default interface StartChatOptionalParams {
    liveChatContext?: LiveChatContext;
    preChatResponse?: object;
    customContext?: object;
    browser?: string;
    os?: string;
    locale?: string;
    device?: string;
    initContext?: InitContext;
    reconnectId?: string;
    wasAuthenticated?: boolean;
    sendDefaultInitContext?: true;
    isProactiveChat?: boolean;
    latitude?: string;
    longitude?: string;
    portalContactId?: string;
    platform?: string;
    handle?: string;
    /**
     * Whether the caller (widget or app embedding the SDK) can handle LCW streaming —
     * progressive ACS chat message chunks delivered to onStreamingMessage. When true,
     * the server will stream bot responses; when false or omitted, the server sends
     * regular non-streaming messages.
     *
     * Omitting this flag (or sending false) is the safe default for callers that have
     * not been updated to render streaming chunks — server falls back to legacy behavior.
     */
    supportsLcwStreaming?: boolean;
}