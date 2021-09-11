import {FileMetadata, IFileManager, IFileUploadRequest, IUploadedFile, PermissionsOptions} from "acs_webchat-chat-adapter/src/types/FileManagerTypes";
import FramedClient from "@microsoft/omnichannel-amsclient/lib/FramedClient";

class AMSFileManager {
    private amsClient: FramedClient;

    public constructor(amsClient: FramedClient) {
        this.amsClient = amsClient;
    }

    public async uploadFiles(files: IFileUploadRequest[]): Promise<IUploadedFile[]> {
        return Promise.all(files.map(async (file: IFileUploadRequest) => this.uploadFileToAMS(file))) as Promise<IUploadedFile[]>;
    }

    public async downloadFiles(files: IUploadedFile[]): Promise<File[]> {
        return Promise.all(files.map(async (file: IUploadedFile) => this.downloadFileFromAMS(file))) as Promise<File[]>;
    }

    public async updatePermissions(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public getFileIds(metadata?: Record<string, string>): string[] | undefined {
        try {
            return JSON.parse(metadata?.amsReferences as string) as string[];
        } catch {

        }
    }

    public createFileIdProperty(fileIds: string[]): Record<string, string> | undefined {
        try {
            return {
                amsReferences: JSON.stringify(fileIds)
            } as Record<string, string>;
        } catch {

        }
    }

    public getFileMetadata(metadata?: Record<string, string>): FileMetadata[] | undefined {
        try {
            return JSON.parse(metadata?.amsMetadata as string);
        } catch {

        }
    }

    public createFileMetadataProperty(metadata: FileMetadata[]): Record<string, string> | undefined {
        try {
            return {
                amsMetadata: JSON.stringify(metadata)
            };
        } catch {

        }
    }

    private async uploadFileToAMS(fileToUpload: IFileUploadRequest): Promise<IUploadedFile | undefined> {
        if (fileToUpload.contentUrl && fileToUpload.name) {
            const blob = await this.amsClient.fetchBlob(fileToUpload.contentUrl);
            const file = new File([blob], fileToUpload.name, { type: fileToUpload.contentType });
            const response: any = await this.amsClient.createObject((this.amsClient as any).chatToken.chatId, file);

            await this.amsClient.uploadDocument(response.id, file);

            return {
                fileId: response.id,
                metadata: {
                    contentType: fileToUpload.contentType,
                    fileName: fileToUpload.name
                }
            }
        }
    }

    private async downloadFileFromAMS(uploadedFile: IUploadedFile): Promise<File | undefined> {
        if (uploadedFile.fileId && uploadedFile.metadata && uploadedFile.metadata.fileName) {
            const fileMetadata = {
                id: uploadedFile.fileId,
                type: uploadedFile.metadata.contentType.split("/").pop() as string
            };

            const response: any = await this.amsClient.getViewStatus(fileMetadata);
            const {view_location} = response;
            const blob: any = await this.amsClient.getView(fileMetadata, view_location);
            const file = new File([blob], uploadedFile.metadata.fileName, { type: uploadedFile.metadata.contentType });
            return file;
        }
    }
}

export default AMSFileManager;