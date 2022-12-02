export default class ACSEndpoints {
    public static readonly sendMessagePathPattern = /chat\/threads\/(19%.+%40thread.v2)\/messages\?api-version=([\d]{4}-[\d]{2}-[\d]{2})/;
    public static readonly getMessagesPathPattern = ACSEndpoints.sendMessagePathPattern;
}