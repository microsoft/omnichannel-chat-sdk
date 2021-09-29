import AMSFileManager from '../../../src/external/ACSAdapter/AMSFileManager';

describe('AMSFileManager', () => {
    (global as any).File = (_: any, __: any, ___: any) => {};

    it('AMSFileManager constructor should take AMSClient as parameter', () => {
        const amsClient: any = {};

        const fileManager = new AMSFileManager(amsClient);
        expect((fileManager as any).amsClient).toBe(amsClient);
    });

    it('AMSFileManager.uploadFileToAMS() should make AMS calls to upload attachment', async () => {
        const amsClient: any = {};
        amsClient.chatToken = {};
        amsClient.chatToken.chatId = '';

        const fileManager = new AMSFileManager(amsClient);
        const createObjectResponse = {id: 'id'};

        (fileManager as any).amsClient.fetchBlob = jest.fn();
        (fileManager as any).amsClient.createObject = jest.fn(() => Promise.resolve(createObjectResponse));
        (fileManager as any).amsClient.uploadDocument = jest.fn();

        const fileToUpload = {
            contentUrl: 'contentUrl',
            name: 'name',
            contentType: 'contentType'
        };

        const response = await (fileManager as any).uploadFileToAMS(fileToUpload);
        expect((fileManager as any).amsClient.fetchBlob).toHaveBeenCalledTimes(1);
        expect((fileManager as any).amsClient.createObject).toHaveBeenCalledTimes(1);
        expect((fileManager as any).amsClient.uploadDocument).toHaveBeenCalledTimes(1);
        expect(response.fileId).toBe(createObjectResponse.id);
        expect(response.metadata.contentType).toBe(fileToUpload.contentType);
        expect(response.metadata.fileName).toBe(fileToUpload.name);
    });

    it('AMSFileManager.downloadFileFromAMS() should make AMS calls to download attachment', async () => {
        const amsClient: any = {};

        const fileManager = new AMSFileManager(amsClient);

        (fileManager as any).amsClient.getViewStatus = jest.fn(() => Promise.resolve({view_location: ''}));
        (fileManager as any).amsClient.getView = jest.fn();

        const uploadedFile = {
            fileId: 'fileId',
            metadata: {
                fileName: 'fileName',
                contentType: 'contentType/contentType'
            }
        };

        const response = await (fileManager as any).downloadFileFromAMS(uploadedFile);
        expect((fileManager as any).amsClient.getViewStatus).toHaveBeenCalledTimes(1);
        expect((fileManager as any).amsClient.getView).toHaveBeenCalledTimes(1);
        expect(response).not.toBeFalsy();
    });
});