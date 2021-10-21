import { IResultAction } from "../../interfaces/IResultAction";
import { IWebChatMiddleware } from "../../interfaces/IWebChatMiddleware";
import { DIRECT_LINE_POST_ACTIVITY_PENDING } from "./ActionTypes";

enum DeliveryMode {
    Bridged = 'bridged',
    Unbridged = 'unbridged'
}

class ChannelDataMiddleware implements IWebChatMiddleware {
    public applicable(action: any): boolean {
        return action.type === DIRECT_LINE_POST_ACTIVITY_PENDING
        && action.payload
        && action.payload.activity
        && action.payload.activity.channelData;
    }

    public apply(action: any): IResultAction {
        const channelIdTag = `ChannelId-lcw`;
        const customerMessageTag = `FromCustomer`;

        const nextAction = action;
        if (nextAction.payload.activity.channelData.tags) {
            if (!nextAction.payload.activity.channelData.tags.includes(channelIdTag)) {
                nextAction.payload.activity.channelData.tags.push(channelIdTag);
            }

            if (!nextAction.payload.activity.channelData.tags.includes(customerMessageTag)) {
                nextAction.payload.activity.channelData.tags.push(customerMessageTag);
            }
        } else {
            nextAction.payload.activity.channelData.tags = [channelIdTag];
            nextAction.payload.activity.channelData.tags.push(customerMessageTag);
        }

        nextAction.payload.activity.channelData.metadata = {
            deliveryMode: DeliveryMode.Bridged
        };

        return {
            dispatchAction: null,
            nextAction: nextAction
        }
    }
}

const createChannelDataMiddleware = () => {
    console.log('[createChannelDataMiddleware]');
    return new ChannelDataMiddleware();
};

export default createChannelDataMiddleware;
