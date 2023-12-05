import {SDKProvider as OCSDKProvider, uuidv4} from "@microsoft/ocsdk";
import { defaultLocaleId, defaultLocaleString, getLocaleIdFromString, getLocaleStringFromId } from "./utils/locale";
import { isCustomerMessage, isSystemMessage } from "./utils/utilities";

import ChatSDKMessage from "./core/messaging/ChatSDKMessage";
import DeliveryMode from "@microsoft/omnichannel-ic3core/lib/model/DeliveryMode";
import {SDKProvider as IC3SDKProvider} from '@microsoft/omnichannel-ic3core';
import IFileInfo from "@microsoft/omnichannel-ic3core/lib/interfaces/IFileInfo";
import IRawMessage from "@microsoft/omnichannel-ic3core/lib/model/IRawMessage";
import MessageContentType from "@microsoft/omnichannel-ic3core/lib/model/MessageContentType";
import MessageType from "@microsoft/omnichannel-ic3core/lib/model/MessageType";
import OmnichannelChatSDK from "./OmnichannelChatSDK";
import PersonType from "@microsoft/omnichannel-ic3core/lib/model/PersonType";
import { ChatSDKErrorName, ChatSDKError } from "./core/ChatSDKError";

export {
    OmnichannelChatSDK,
    IC3SDKProvider,
    OCSDKProvider,
    uuidv4,
    ChatSDKMessage,
    ChatSDKErrorName,
    ChatSDKError,
    IRawMessage,
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
    ic3sdk: { IC3SDKProvider },
    ocsdk: { OCSDKProvider, uuidv4 }
};