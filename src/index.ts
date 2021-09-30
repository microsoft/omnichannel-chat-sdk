import {SDKProvider as OCSDKProvider, uuidv4 } from "@microsoft/ocsdk";
import {SDKProvider as IC3SDKProvider} from '@microsoft/omnichannel-ic3core';
import OmnichannelChatSDK from "./OmnichannelChatSDK";
import IChatSDKMessage from "./core/messaging/IChatSDKMessage";
import IRawMessage from "@microsoft/omnichannel-ic3core/lib/model/IRawMessage";
import MessageContentType from "@microsoft/omnichannel-ic3core/lib/model/MessageContentType";
import DeliveryMode from "@microsoft/omnichannel-ic3core/lib/model/DeliveryMode";
import MessageType from "@microsoft/omnichannel-ic3core/lib/model/MessageType";
import PersonType from "@microsoft/omnichannel-ic3core/lib/model/PersonType";
import IFileInfo from "@microsoft/omnichannel-ic3core/lib/interfaces/IFileInfo";
import { isSystemMessage, isCustomerMessage } from "./utils/utilities";

export {
    OmnichannelChatSDK,
    IC3SDKProvider,
    OCSDKProvider,
    uuidv4,
    IChatSDKMessage,
    IRawMessage,
    MessageContentType,
    DeliveryMode,
    MessageType,
    PersonType,
    IFileInfo,
    isSystemMessage,
    isCustomerMessage
}

export default {
    OmnichannelChatSDK,
    ic3sdk: { IC3SDKProvider },
    ocsdk: { OCSDKProvider, uuidv4 }
};