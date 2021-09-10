import {FileMetadata, IFileManager, IFileUploadRequest, IUploadedFile, PermissionsOptions} from "acs_webchat-chat-adapter/src/types/FileManagerTypes";
import FramedClient from "@microsoft/omnichannel-amsclient/lib/FramedClient";

class AMSFileManager implements IFileManager {
    private amsClient: FramedClient;

    public constructor(amsClient: FramedClient) {
        this.amsClient = amsClient;
    }

    uploadFiles(files: IFileUploadRequest[]): Promise<IUploadedFile[]> {
        throw new Error("Method not implemented.");
    }

    downloadFiles(files: IUploadedFile[]): Promise<File[]> {
        throw new Error("Method not implemented.");
    }

    updatePermissions(file: IUploadedFile, permissions: PermissionsOptions): Promise<void> {
        throw new Error("Method not implemented.");
    }

    getFileIds(metadata?: Record<string, string>): string[] | undefined {
        throw new Error("Method not implemented.");
    }

    createFileIdProperty(fileIds: string[]): Record<string, string> {
        throw new Error("Method not implemented.");
    }

    getFileMetadata(metadata?: Record<string, string>): FileMetadata[] | undefined {
        throw new Error("Method not implemented.");
    }

    createFileMetadataProperty(metadata: FileMetadata[]): Record<string, string> {
        throw new Error("Method not implemented.");
    }
}

export default AMSFileManager;