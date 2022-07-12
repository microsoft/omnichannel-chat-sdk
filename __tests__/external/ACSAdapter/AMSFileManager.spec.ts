import AMSFileManager from '../../../src/external/ACSAdapter/AMSFileManager';

describe('AMSFileManager', () => {
    (global as any).File = (_: any, __: any, ___: any) => {};

    it('AMSFileManager constructor should take AMSClient as parameter', () => {
        const amsClient: any = {};

        const fileManager = new AMSFileManager(amsClient);
        expect((fileManager as any).amsClient).toBe(amsClient);
    });

    it('AMSFileManager.uploadFiles() should call AMSFileManager.uploadFileToAMS()', async () => {
        const amsClient: any = {};

        const fileManager = new AMSFileManager(amsClient);
        (fileManager as any).uploadFileToAMS = jest.fn(() => Promise.resolve({}));

        const fileUploadRequests: any = [{}, {}];

        const response = await fileManager.uploadFiles(fileUploadRequests);
        expect((fileManager as any).uploadFileToAMS).toHaveBeenCalledTimes(fileUploadRequests.length);
        expect(response).not.toBeFalsy();
    });

    it('AMSFileManager.downloadFiles() should call AMSFileManager.downloadFileFromAMS()', async () => {
        const amsClient: any = {};

        const fileManager = new AMSFileManager(amsClient);
        (fileManager as any).downloadFileFromAMS = jest.fn(() => Promise.resolve({}));

        const uploadedFiles: any = [{}, {}];

        const response = await fileManager.downloadFiles(uploadedFiles);
        expect((fileManager as any).downloadFileFromAMS).toHaveBeenCalledTimes(uploadedFiles.length);
        expect(response).not.toBeFalsy();
    });

    it('AMSFileManager.updatePermissions() should be undefined', async () => {
        const amsClient: any = {};

        const fileManager = new AMSFileManager(amsClient);

        const response = await fileManager.updatePermissions();
        expect(response).toBe(undefined);
    });

    it('AMSFileManager.getFileIds() should return a JSON data', async () => {
        const amsClient: any = {};
        const logger: any = {};
        logger.startScenario = jest.fn();
        logger.completeScenario = jest.fn();
        logger.failScenario = jest.fn();

        const fileManager = new AMSFileManager(amsClient, logger);

        const amsReferences = [{id: 'id'}];
        const metadata = {
            amsReferences: JSON.stringify(amsReferences)
        };

        const response = fileManager.getFileIds(metadata);
        expect(response).toStrictEqual(amsReferences);
        expect(logger.startScenario).toBeCalledTimes(1);
    });

    it('AMSFileManager.getFileIds() should return nothing if invalid', async () => {
        const amsClient: any = {};
        const logger: any = {};
        logger.startScenario = jest.fn();
        logger.completeScenario = jest.fn();
        logger.failScenario = jest.fn();

        const fileManager = new AMSFileManager(amsClient, logger);

        const metadata = {};

        const response = fileManager.getFileIds(metadata);
        expect(response).toBeFalsy();
        expect(logger.startScenario).toBeCalledTimes(0);
    });

    it('AMSFileManager.createFileIdProperty() should return a JSON data', async () => {
        const amsClient: any = {};

        const fileManager = new AMSFileManager(amsClient);

        const fileIds = ['id', 'id'];

        const response: any = fileManager.createFileIdProperty(fileIds);
        expect(response.amsReferences).toBe(JSON.stringify(fileIds));
    });

    it('AMSFileManager.getFileMetadata() should return a JSON data', async () => {
        const amsClient: any = {};

        const fileManager = new AMSFileManager(amsClient);

        const amsMetadata  = {
            data: 'data'
        }

        const metadata = {
            amsMetadata: JSON.stringify(amsMetadata)
        };

        const response = fileManager.getFileMetadata(metadata);
        expect(response).toStrictEqual(amsMetadata);
    });

    it('AMSFileManager.getFileMetadata() should return nothing if invalid', async () => {
        const amsClient: any = {};

        const fileManager = new AMSFileManager(amsClient);

        const metadata = {};

        const response = fileManager.getFileMetadata(metadata);
        expect(response).toBeFalsy();
    });

    it('AMSFileManager.createFileMetadataProperty() should return a JSON data', async () => {
        const amsClient: any = {};

        const fileManager = new AMSFileManager(amsClient);

        const metadata: any = [
            {contentType: 'contentType', fileName: 'fileName'}
        ]

        const response: any = fileManager.createFileMetadataProperty(metadata);
        expect(response.amsMetadata).toBe(JSON.stringify(metadata));
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