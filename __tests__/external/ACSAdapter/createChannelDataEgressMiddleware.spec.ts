import { channelIdTag, customerMessageTag } from "../../../src/core/messaging/MessageTags";
import { DeliveryMode } from "../../../src/core/messaging/OmnichannelMessage";
import createChannelDataEgressMiddleware from "../../../src/external/ACSAdapter/createChannelDataEgressMiddleware";

describe('createChannelDataEgressMiddleware', () => {
    it('createChannelDataEgressMiddleware should call next if there\'s no channel data', () => {
        const channelData = {
            widgetId: 'widgetId'
        };
        const next = jest.fn();
        const activity = {};

        createChannelDataEgressMiddleware(channelData)()(next)(activity);

        expect(next).toHaveBeenCalledWith(activity);
    });

    it('createChannelDataEgressMiddleware should add basic tags if not set', () => {
        const channelData = {
            widgetId: 'widgetId'
        };
        const next = jest.fn();
        const activity = {
            channelData: {} as any // eslint-disable-line @typescript-eslint/no-explicit-any
        };

        createChannelDataEgressMiddleware(channelData)()(next)(activity);

        expect(activity.channelData).toBeDefined();
        expect(activity.channelData.tags.includes(channelIdTag)).toBe(true);
        expect(activity.channelData.tags.includes(customerMessageTag)).toBe(true);
        expect(next).toHaveBeenCalledWith(activity);
    });

    it('createChannelDataEgressMiddleware should add \'channelIdTag\' if not set', () => {
        const channelData = {
            widgetId: 'widgetId'
        };
        const next = jest.fn();
        const activity = {
            channelData: {
                tags: [customerMessageTag]
            } as any // eslint-disable-line @typescript-eslint/no-explicit-any
        };

        createChannelDataEgressMiddleware(channelData)()(next)(activity);

        expect(activity.channelData).toBeDefined();
        expect(activity.channelData.tags.includes(channelIdTag)).toBe(true);
        expect(next).toHaveBeenCalledWith(activity);
    });

    it('createChannelDataEgressMiddleware should add \'customerMessageTag\' if not set', () => {
        const channelData = {
            widgetId: 'widgetId'
        };
        const next = jest.fn();
        const activity = {
            channelData: {
                tags: [channelIdTag]
            } as any // eslint-disable-line @typescript-eslint/no-explicit-any
        };

        createChannelDataEgressMiddleware(channelData)()(next)(activity);

        expect(activity.channelData).toBeDefined();
        expect(activity.channelData.tags.includes(customerMessageTag)).toBe(true);
        expect(next).toHaveBeenCalledWith(activity);
    });

    it('createChannelDataEgressMiddleware should have deliveryMode as metadata if not set', () => {
        const channelData = {
            widgetId: 'widgetId'
        };
        const next = jest.fn();
        const activity = {
            channelData: {} as any // eslint-disable-line @typescript-eslint/no-explicit-any
        };

        createChannelDataEgressMiddleware(channelData)()(next)(activity);

        expect(activity.channelData).toBeDefined();
        expect(activity.channelData.metadata).toBeDefined();
        expect(activity.channelData.metadata.deliveryMode).toBeDefined();
        expect(activity.channelData.metadata.deliveryMode).toBe(DeliveryMode.Bridged);
        expect(next).toHaveBeenCalledWith(activity);
    });

    it('createChannelDataEgressMiddleware MUST have widgetId as metadata', () => {
        const channelData = {
            widgetId: 'widgetId'
        };
        const next = jest.fn();
        const activity = {
            channelData: {} as any // eslint-disable-line @typescript-eslint/no-explicit-any
        };

        createChannelDataEgressMiddleware(channelData)()(next)(activity);

        expect(activity.channelData).toBeDefined();
        expect(activity.channelData.metadata).toBeDefined();
        expect(activity.channelData.metadata.widgetId).toBeDefined();
        expect(activity.channelData.metadata.widgetId).toBe(channelData.widgetId);
        expect(next).toHaveBeenCalledWith(activity);
    });
});