import { createACSAdapter, createDirectLine, createIC3Adapter } from "../utils/chatAdapterCreators";

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