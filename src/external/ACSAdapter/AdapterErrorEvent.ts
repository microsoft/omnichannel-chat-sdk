export interface AdapterErrorEvent {
	StatusCode?: number;
	ErrorType: string;
	ErrorMessage?: string;
	ErrorStack?: string;
	ErrorDetails?: object;
	Timestamp: string;
	correlationVector?: string;
	AcsChatDetails?: AcsChatDetails;
	AdditionalParams?: object;
}

export interface AcsChatDetails {
	UserId?: string;
	ThreadId?: string;
	MessageId?: string;
}