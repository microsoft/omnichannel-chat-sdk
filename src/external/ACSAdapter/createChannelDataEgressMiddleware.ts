import { DeliveryMode } from "../../core/messaging/OmnichannelMessage";

interface ChannelData {
    widgetId: string;
}

const createChannelDataEgressMiddleware = (channelData: ChannelData): CallableFunction => {
    const channelIdTag = `ChannelId-lcw`; // Tag for PVA bot to return proper response for live chat channel
    const customerMessageTag = `FromCustomer`; // Tag to support transcript analytics feature

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channelDataMiddleware = () => (next: any) => (activity: any) => {
        const applicable = activity && activity.channelData;

        if (applicable) {
            if (activity.channelData.tags) {
                if (!activity.channelData.tags.includes(channelIdTag)) {
                    activity.channelData.tags.push(channelIdTag);
                }

                if (!activity.channelData.tags.includes(customerMessageTag)) {
                    activity.channelData.tags.push(customerMessageTag);
                }
            } else {
                activity.channelData.tags = [channelIdTag];
                activity.channelData.tags.push(customerMessageTag);
            }

            activity.channelData.metadata = {
                deliveryMode: DeliveryMode.Bridged
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