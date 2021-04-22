export default interface IIC3SDKLogData {
    SubscriptionId: string;
    EndpointUrl: string;
    ElapsedTimeInMilliseconds: number;
    Event: string;
    ErrorCode: string;
    ExceptionDetails: object;
    Description: string;
}