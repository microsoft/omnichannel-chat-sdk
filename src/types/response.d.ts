import PostChatContext from "../core/PostChatContext";

export type OmnichannelGenericResponse = {
	data : {} | undefined;
	error? : string;
	success: boolean;
}

export type MaskingRule = {
    id: string;
    regex: string;

}

export type GetMaskingRulesResponse = {
    data : MaskingRule[] | undefined;
    error? : string;
    success: boolean;
};

// wraps an adaptive card that will be render by UI, no need to deconstruct the card in types
export type GetPrechatSurveyResponse = OmnichannelGenericResponse;
export type GetDataMaskingRulesResponse = OmnichannelGenericResponse;
export type EmailLiveChatTranscriptResponse = OmnichannelGenericResponse;
export type GetLiveChatTranscriptResponse = OmnichannelGenericResponse;

export type GetPostChatSurveyContextResponse = {
	data : PostChatContext | undefined;
	error? : string;
	success: boolean;
};

export type GetAgentAvailabilityResponse = OmnichannelGenericResponse;
export type CreateChatAdapterResponse = OmnichannelGenericResponse;
