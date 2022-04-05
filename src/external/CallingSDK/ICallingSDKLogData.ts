export default interface ICallingSDKLogData {
    CallId: string;
    Event: string;
    ElapsedTimeInMilliseconds: number;
    ExceptionDetails: object;
    Description: string;
}