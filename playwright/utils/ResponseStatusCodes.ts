export default class ResponseStatusCodes {
    public static readonly OmnichannelEndpoints = {
        LiveChatLiveWorkItemDetails: [
            400, // Legacy Infra
            404, // CoreServices (New) (Not in Production yet)
            500, // CoreServices (Production) (Soon to be deprecated)
        ],
        LiveChatAuthLiveWorkItemDetails: () => {this.OmnichannelEndpoints.LiveChatLiveWorkItemDetails}
    }
}