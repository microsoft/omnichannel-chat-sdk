import { ACSAdapter, ChatAdapter, DirectLineAdapter, GeneralResponse, GetAgentAvailabilityResponse, GetCurrentLiveChatContextResponse, GetLiveChatTranscriptResponse, GetMessagesResponse, GetPreChatSurveyResponse, GetVoiceVideoCallingResponse, MaskingRule, MaskingRules, UploadFileAttachmentResponse } from "./types/response";
import { AmsClient, ChatWidgetLanguage, DataMaskingInfo, LiveChatConfig, LiveWSAndLiveChatEngJoin, Setting, VoiceVideoCallingOptionalParams } from "./types/config";
import { ChatSDKError, ChatSDKErrorName } from "./core/ChatSDKError";
import {SDKProvider as OCSDKProvider, uuidv4} from "@microsoft/ocsdk";
import { defaultLocaleId, defaultLocaleString, getLocaleIdFromString, getLocaleStringFromId } from "./utils/locale";
import { isCustomerMessage, isSystemMessage } from "./utils/utilities";

import ChatSDKMessage from "./core/messaging/ChatSDKMessage";
import DeliveryMode from "@microsoft/omnichannel-ic3core/lib/model/DeliveryMode";
import IFileInfo from "@microsoft/omnichannel-ic3core/lib/interfaces/IFileInfo";
import IRawMessage from "@microsoft/omnichannel-ic3core/lib/model/IRawMessage";
import MessageContentType from "@microsoft/omnichannel-ic3core/lib/model/MessageContentType";
import MessageType from "@microsoft/omnichannel-ic3core/lib/model/MessageType";
import OmnichannelChatSDK from "./OmnichannelChatSDK";
import PersonType from "@microsoft/omnichannel-ic3core/lib/model/PersonType";

export {
    OmnichannelChatSDK,
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
    defaultLocaleString,
    VoiceVideoCallingOptionalParams,
    AmsClient,
    LiveChatConfig,
    ChatWidgetLanguage,
    Setting,
    DataMaskingInfo,
    LiveWSAndLiveChatEngJoin,
    MaskingRule,
    MaskingRules,
    GeneralResponse,
    GetPreChatSurveyResponse,
    GetLiveChatTranscriptResponse,
    DirectLineAdapter,
    ACSAdapter,
    ChatAdapter,
    GetAgentAvailabilityResponse,
    GetVoiceVideoCallingResponse,
    UploadFileAttachmentResponse,
    GetMessagesResponse,
    GetCurrentLiveChatContextResponse
}

export default {
    OmnichannelChatSDK,
    ocsdk: { OCSDKProvider, uuidv4 }
};