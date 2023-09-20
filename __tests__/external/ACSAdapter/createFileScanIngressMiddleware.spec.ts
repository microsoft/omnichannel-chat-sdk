import createFileScanIngressMiddleware from "../../../src/external/ACSAdapter/createFileScanIngressMiddleware";

describe('createFileScanIngressMiddleware', () => {
    it('createFileScanIngressMiddleware should call next if activity has no attachments', () => {
        const next = jest.fn();
        const activity = {};

        createFileScanIngressMiddleware()()(next)(activity);

        expect(next).toHaveBeenCalledWith(activity);
    });

    it("createFileScanIngressMiddleware should populate 'activity.channelData.metadata.amsreferences' from 'activity.channelData.metadata.amsReferences' if doesn't exist", () => {
        const next = jest.fn();

        const fileMetadata = {id: "id", type: "type", name: "name", size: 0};
        const attachment = {contentType: fileMetadata.type, name: fileMetadata.name, thumbnailUrl: undefined};
        const attachments = [attachment];
        const amsReferences = [fileMetadata.id];
        const activity = {
            attachments,
            channelData: {
                metadata: {
                    amsReferences: JSON.stringify(amsReferences)
                }
            }
        };

        createFileScanIngressMiddleware()()(next)(activity);

        expect(next).toHaveBeenCalledWith(activity);
        expect(Object.keys(activity.channelData.metadata).indexOf("amsreferences") >= 0).toBe(true);
        expect((activity.channelData.metadata as any)["amsreferences"]).toBe(activity.channelData.metadata.amsReferences);
    });
});