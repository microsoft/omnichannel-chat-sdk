export default interface IOCSDKLogData {
    RequestId: string;
    Event: string;
    Region: string;
    ElapsedTimeInMilliseconds: number;
    TransactionId: string;
    ExceptionDetails: object;
    Description: string;
    RequestHeaders: string;
    RequestPayload: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    RequestPath: string;
    RequestMethod: string;
    ResponseStatusCode: string;
}