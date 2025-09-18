import QueueAvailability from "@microsoft/ocsdk/lib/Model/QueueAvailability";
import { createACSAdapter, createDirectLine, createIC3Adapter } from "../utils/chatAdapterCreators";
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

export type PersistentChatHistoryApplication = {
	displayName: string;
	id: string;
	additionalData: unknown | null;
	oDataType: string | null;
}

export type PersistentChatHistoryFrom = {
	application: PersistentChatHistoryApplication | null;
	device: unknown | null;
	user: unknown | null;
	additionalData: unknown | null;
	oDataType: string | null;
}

export type PersistentChatHistoryMessage = {
	created: string;
	isControlMessage: boolean;
	transcriptOriginalMessageId: string;
	content: string;
	contentType: number;
	createdDateTime: string;
	culture: string | null;
	deleted: boolean;
	from: PersistentChatHistoryFrom;
	important: unknown | null;
	likes: unknown | null;
	modifiedDateTime: string | null;
	attachments: unknown[];
	mentions: unknown | null;
	id: string;
	oDataType: string | null;
	additionalData: {
		deliveryMode: string;
		widgetId: string;
		clientActivityId: string;
		tags: string;
		ConversationId: string;
	};
}

export type GetPersistentChatHistoryResponse = {
	chatMessages: PersistentChatHistoryMessage[];
	nextPageToken: string | null;
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