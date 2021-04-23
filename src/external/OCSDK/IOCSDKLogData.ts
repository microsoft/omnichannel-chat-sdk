export default interface IOCSDKLogData {
    RequestId: string;
    Event: string;
    Region: string;
    ElapsedTimeInMilliseconds: number;
    TransactionId: string;
    ExceptionDetails: object;
    Description: string;
}