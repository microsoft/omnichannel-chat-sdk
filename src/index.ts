import { ACSAdapter, ChatAdapter, DirectLineAdapter, GeneralResponse, GetAgentAvailabilityResponse, GetCurrentLiveChatContextResponse, GetLiveChatTranscriptResponse, GetMessagesResponse, GetPersistentChatHistoryResponse, GetPreChatSurveyResponse, GetVoiceVideoCallingResponse, IC3Adapter, MaskingRule, MaskingRules, UploadFileAttachmentResponse } from "./types/response";
import { AmsClient, ChatWidgetLanguage, DataMaskingInfo, LiveChatConfig, LiveWSAndLiveChatEngJoin, Setting, VoiceVideoCallingOptionalParams } from "./types/config";
import { ChatSDKError, ChatSDKErrorName } from "./core/ChatSDKError";
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
import OmnichannelStreamingMessage from "./core/messaging/OmnichannelStreamingMessage";
import OnStreamingMessageOptionalParams from "./core/messaging/OnStreamingMessageOptionalParams";
import PersonType from "@microsoft/omnichannel-ic3core/lib/model/PersonType";
import PolicyViolation from "./core/messaging/PolicyViolation";
import StreamingMetadata from "./core/messaging/StreamingMetadata";

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
    GetPersistentChatHistoryResponse,
    DirectLineAdapter,
    ACSAdapter,
    IC3Adapter,
    ChatAdapter,
    GetAgentAvailabilityResponse,
    GetVoiceVideoCallingResponse,
    UploadFileAttachmentResponse,
    GetMessagesResponse,
    GetCurrentLiveChatContextResponse,
    OmnichannelStreamingMessage,
    OnStreamingMessageOptionalParams,
    PolicyViolation,
    StreamingMetadata,
}

export default {
    OmnichannelChatSDK,
    ic3sdk: { IC3SDKProvider },
    ocsdk: { OCSDKProvider, uuidv4 }
};