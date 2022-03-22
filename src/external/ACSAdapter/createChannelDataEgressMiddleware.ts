import { channelIdTag, customerMessageTag } from "../../core/messaging/MessageTags";
import { DeliveryMode } from "../../core/messaging/OmnichannelMessage";

interface ChannelData {
    widgetId: string;
}

const createChannelDataEgressMiddleware = (channelData: ChannelData): CallableFunction => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channelDataMiddleware = () => (next: any) => (activity: any) => {
        const applicable = activity && activity.channelData;

        if (applicable) {
            if (!activity.channelData.tags) {
                activity.channelData.tags = [];
            }

            if (!activity.channelData.tags.includes(channelIdTag)) {
                activity.channelData.tags.push(channelIdTag);
            }

            if (!activity.channelData.tags.includes(customerMessageTag)) {
                activity.channelData.tags.push(customerMessageTag);
            }

            if (!activity.channelData.metadata) {
                activity.channelData.metadata = {};
            }

            if (!activity.channelData.metadata.deliveryMode) {
                activity.channelData.metadata.deliveryMode = DeliveryMode.Bridged;
            }

            if (channelData.widgetId) {
                activity.channelData.metadata.widgetId = channelData.widgetId;
            }
        }

        return next(activity);
    }

    return channelDataMiddleware;
}

export default createChannelDataEgressMiddleware;