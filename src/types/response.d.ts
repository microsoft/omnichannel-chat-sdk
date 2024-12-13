
export type OmnichannelGenericResponse = {
	data : {} | undefined;
	error? : string;
	success: boolean;
}

export type MaskingRule = {
    id: string;
    regex: string;

}

export type MaskingRules = {
	rules: MaskingRule[];
}

// wraps an adaptive card that will be render by UI, no need to deconstruct the card in types
export type GetPrechatSurveyResponse = OmnichannelGenericResponse;

// Response from OCSDK is a string (JSON)
export type GetLiveChatTranscriptResponse = {
	data : string | undefined;
	error? : string;
	success: boolean;
};

export type CreateChatAdapterResponse = OmnichannelGenericResponse;