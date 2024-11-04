import {SDKProvider as OCSDKProvider, uuidv4} from "@microsoft/ocsdk";
import { defaultLocaleId, defaultLocaleString, getLocaleIdFromString, getLocaleStringFromId } from "./utils/locale";
import { isCustomerMessage, isSystemMessage } from "./utils/utilities";

import ChatSDKMessage from "./core/messaging/ChatSDKMessage";
import OmnichannelChatSDK from "./OmnichannelChatSDK";
import { ChatSDKErrorName, ChatSDKError } from "./core/ChatSDKError";
import OmnichannelMessage, { DeliveryMode, IFileInfo, MessageContentType, MessageType, PersonType } from "./core/messaging/OmnichannelMessage";

export {
    OmnichannelChatSDK,
    OCSDKProvider,
    uuidv4,
    ChatSDKMessage,
    ChatSDKErrorName,
    ChatSDKError,
    OmnichannelMessage,
    MessageContentType,
    DeliveryMode,
    MessageType,
    PersonType,
    IFileInfo,
    isSystemMessage,
    isCustomerMessage,
    getLocaleStringFromId,
    getLocaleIdFromString,
    defaultLocaleId,
    defaultLocaleString
}

export default {
    OmnichannelChatSDK,
    ocsdk: { OCSDKProvider, uuidv4 }
};