import QueueAvailability from "@microsoft/ocsdk/lib/Model/QueueAvailability";
import { createACSAdapter, createDirectLine } from "../utils/chatAdapterCreators";
import { VoiceVideoCallingProxy } from "../api/createVoiceVideoCalling";
import OmnichannelMessage from "../core/messaging/OmnichannelMessage";
import IRawMessage from "@microsoft/omnichannel-ic3core/lib/model/IRawMessage";
import IMessage from "@microsoft/omnichannel-ic3core/lib/model/IMessage";
import LiveChatContext from "../core/LiveChatContext";

export type MaskingRule = {
	id: string;
	regex: string;
}
export type MaskingRules = {
	rules: MaskingRule[];
}
export type GeneralResponse = {} | string | undefined;
export type GetPreChatSurveyResponse = GeneralResponse;
export type GetLiveChatTranscriptResponse = GeneralResponse;
export type DirectLineAdapter = ReturnType<typeof createDirectLine>;
export type ACSAdapter = ReturnType<typeof createACSAdapter>;
export type IC3Adapter = ReturnType<typeof createIC3Adapter>;
export type ChatAdapter = DirectLineAdapter | ACSAdapter | IC3Adapter;
export type GetAgentAvailabilityResponse = QueueAvailability | undefined;
export type GetVoiceVideoCallingResponse = VoiceVideoCallingProxy | undefined;
export type UploadFileAttachmentResponse = IRawMessage | OmnichannelMessage;
export type GetMessagesResponse = IMessage[] | OmnichannelMessage[] | undefined;
export type GetCurrentLiveChatContextResponse = LiveChatContext | {};