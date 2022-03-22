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
        const channelIdTag = `ChannelId-lcw`;
        const customerMessageTag = `FromCustomer`;
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

    it('createChannelDataEgressMiddleware MUST have widgetId', () => {
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