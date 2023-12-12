import FramedClient from "@microsoft/omnichannel-amsclient/lib/FramedClient";
import { ACSAdapterLogger } from "../../utils/loggers";
import AMSFileScanner from "./AMSFileScanner";
import OmnichannelChatToken from "@microsoft/omnichannel-amsclient/lib/OmnichannelChatToken";

type FileMetadata = Record<string, string>;

enum FilePermission {
    READ,
    WRITE
}

interface IUploadedFile {
   fileId: string;
   metadata?: FileMetadata;
}

interface IAttachment {
    name: string;
    contentType: string;
    contentUrl: string;
    thumbnailUrl?: string;
}

interface IFileUploadRequest extends IAttachment {
    permissions?: PermissionsOptions;
}

interface PermissionsOptions {
    users: string[];
    permission: FilePermission;
}

interface AmsReferenceContent {
    uniqueId: string;
}

interface BotAttachment {
    name: string;
    contentType: string;
    content: AmsReferenceContent;
}

enum AMSFileManagerEvent {
    AMSUpload = 'AMSUpload',
    AMSDownload = 'AMSDownload',
    GetFileIds = 'GetFileIds',
    CreateFileIdProperty = 'CreateFileIdProperty',
    GetFileMetadata = 'GetFileMetadata',
    CreateFileMetadataProperty = 'CreateFileMetadataProperty'
}

export enum AMSViewScanStatus {
    PASSED = "passed",
    MALWARE = "malware",
    INPROGRESS = "in progress"
}

const supportedImagesMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/heic", "image/webp"];

class AMSFileManager {
    private logger: ACSAdapterLogger | null;
    private amsClient: FramedClient;
    private options: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    private supportedImagesMimeTypes = supportedImagesMimeTypes;
    private omnichannelChatToken: OmnichannelChatToken | null;
    public fileScanner: any; // eslint-disable-line @typescript-eslint/no-explicit-any

    public constructor(amsClient: FramedClient, logger: ACSAdapterLogger | null = null, options: any = {}) {  // eslint-disable-line @typescript-eslint/no-explicit-any
        this.logger = logger;
        this.amsClient = amsClient;
        this.options = options;
        this.omnichannelChatToken = null;

        if (this.options.fileScan?.disabled === false) {
            const options = {...this.options.fileScan};
            this.fileScanner = new AMSFileScanner(this.amsClient, options);
        }
    }

    public async uploadFiles(files: IFileUploadRequest[]): Promise<IUploadedFile[]> {
        return Promise.all(files.map(async (file: IFileUploadRequest) => this.uploadFileToAMS(file))) as Promise<IUploadedFile[]>;
    }

    public async downloadFiles(files: IUploadedFile[]): Promise<File[]> {
        return Promise.all(files.map(async (file: IUploadedFile) => this.downloadFileFromAMS(file))) as Promise<File[]>;
    }

    public async updatePermissions(): Promise<void> {
        return undefined;
    }

    public getFileIds(metadata?: Record<string, string>): string[] | undefined {
        if (!metadata) {
            return;
        }

        if (!metadata.amsReferences && !metadata.amsreferences) {
            return;
        }

        this.logger?.startScenario(AMSFileManagerEvent.GetFileIds);

        try {
            let result = undefined;
            if (metadata?.amsReferences) {
                result = JSON.parse(metadata?.amsReferences as string) as string[];
            }

            if (metadata?.amsreferences) {
                result = JSON.parse(metadata?.amsreferences as string) as string[];
            }

            this.logger?.completeScenario(AMSFileManagerEvent.GetFileIds);
            return result;
        } catch (error) {
            const exceptionDetails = {
                metadata: `${metadata}`,
                errorObject: `${error}`
            };

            this.logger?.failScenario(AMSFileManagerEvent.GetFileIds, {
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            return undefined;
        }
    }

    /**
     * Creates property for the reference of the attachments to be sent to ACS as metadata after successful upload.
     *
     * @param fileIds List of fileIds
     * @returns
     */
    public createFileIdProperty(fileIds: string[]): Record<string, string> | undefined {
        if (!fileIds) {
            return;
        }

        this.logger?.startScenario(AMSFileManagerEvent.CreateFileIdProperty);

        try {
            const result = {
                amsReferences: JSON.stringify(fileIds),
                amsreferences: JSON.stringify(fileIds)
            } as Record<string, string>;
            this.logger?.completeScenario(AMSFileManagerEvent.CreateFileIdProperty);
            return result;
        } catch (error) {
            const exceptionDetails = {
                fileIds: `${fileIds}`,
                errorObject: `${error}`
            };

            this.logger?.failScenario(AMSFileManagerEvent.CreateFileIdProperty, {
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            return undefined;
        }
    }

    public getFileMetadata(metadata?: Record<string, string>): FileMetadata[] | undefined {
        if (!metadata || !metadata.amsMetadata) {
            return;
        }

        this.logger?.startScenario(AMSFileManagerEvent.GetFileMetadata);

        try {
            const result = JSON.parse(metadata?.amsMetadata as string);
            this.logger?.completeScenario(AMSFileManagerEvent.GetFileMetadata);
            return result;
        } catch (error) {
            const exceptionDetails = {
                metadata: `${metadata}`,
                errorObject: `${error}`
            };

            this.logger?.failScenario(AMSFileManagerEvent.GetFileMetadata, {
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            return undefined;
        }
    }

    /**
     *
     * Creates property for the metadata of the attachments to be sent to ACS as metadata after successful upload.
     *
     * @param metadata List of file metadata
     * @returns
     */
    public createFileMetadataProperty(metadata: FileMetadata[]): Record<string, string> | undefined {
        if (!metadata) {
            return;
        }

        this.logger?.startScenario(AMSFileManagerEvent.CreateFileMetadataProperty);

        try {
            const result = {
                amsMetadata: JSON.stringify(metadata)
            };
            this.logger?.completeScenario(AMSFileManagerEvent.CreateFileMetadataProperty);
            return result;
        } catch (error) {
            const exceptionDetails = {
                metadata: `${metadata}`,
                errorObject: `${error}`
            };

            this.logger?.failScenario(AMSFileManagerEvent.CreateFileMetadataProperty, {
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            return undefined;
        }
    }

    /**
     * Creates content to be sent to ACS after successful upload.
     *
     * @param metadata List of file metadata
     * @returns
     */
    public createBotAttachment(metadata: Record<string, string>): BotAttachment | null {
        if (!metadata || Object.keys(metadata).length === 0) {
            return null;
        }

        // Sending empty content
        return null;
    }

    private async uploadFileToAMS(fileToUpload: IFileUploadRequest): Promise<IUploadedFile | undefined> {
        this.logger?.startScenario(AMSFileManagerEvent.AMSUpload);

        if (fileToUpload.contentUrl && fileToUpload.name) {
            let blob;

            try {
                blob = await this.amsClient.fetchBlob(fileToUpload.contentUrl);
            } catch (error) {
                const exceptionDetails = {
                    response: 'AMSFetchBlobFailure',
                    errorObject: `${error}`
                };

                this.logger?.failScenario(AMSFileManagerEvent.AMSUpload, {
                    ExceptionDetails: JSON.stringify(exceptionDetails)
                });

                throw error;
            }

            const file = new File([blob as Blob], fileToUpload.name, { type: fileToUpload.contentType });

            let response: any;  // eslint-disable-line @typescript-eslint/no-explicit-any
            try {
                response = await this.amsClient.createObject((this.amsClient as any).chatToken.chatId, file, this.omnichannelChatToken, this.supportedImagesMimeTypes);  // eslint-disable-line @typescript-eslint/no-explicit-any
            } catch (error) {
                const exceptionDetails = {
                    response: 'AMSCreateObjectFailure',
                    errorObject: `${error}`
                };

                this.logger?.failScenario(AMSFileManagerEvent.AMSUpload, {
                    ExceptionDetails: JSON.stringify(exceptionDetails)
                });

                throw error;
            }

            try {
                await this.amsClient.uploadDocument(response.id, file, this.omnichannelChatToken, this.supportedImagesMimeTypes);
            } catch (error) {
                const exceptionDetails = {
                    response: 'AMSUploadDocumentFailure',
                    errorObject: `${error}`
                };

                this.logger?.failScenario(AMSFileManagerEvent.AMSUpload, {
                    ExceptionDetails: JSON.stringify(exceptionDetails)
                });

                throw error;
            }

            this.logger?.completeScenario(AMSFileManagerEvent.AMSUpload);

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
        this.logger?.startScenario(AMSFileManagerEvent.AMSDownload);

        if (uploadedFile.fileId && uploadedFile.metadata && uploadedFile.metadata.fileName) {
            const fileMetadata = {
                id: uploadedFile.fileId,
                type: uploadedFile.metadata.contentType,
                name: uploadedFile.metadata.fileName
            };

            let response: any;  // eslint-disable-line @typescript-eslint/no-explicit-any

            try {
                response = await this.amsClient.getViewStatus(fileMetadata, this.omnichannelChatToken, this.supportedImagesMimeTypes);  // eslint-disable-line @typescript-eslint/no-explicit-any
            } catch (error) {
                const exceptionDetails = {
                    response: 'AMSGetViewStatusFailure',
                    errorObject: `${error}`
                };

                this.logger?.failScenario(AMSFileManagerEvent.AMSDownload, {
                    ExceptionDetails: JSON.stringify(exceptionDetails)
                });

                return undefined;
            }

            let blob: any;  // eslint-disable-line @typescript-eslint/no-explicit-any

            const {view_location, scan} = response;

            if (this.options.fileScan?.disabled === false && scan && scan?.status !== AMSViewScanStatus.PASSED) {
                const file = new File([blob], uploadedFile.metadata.fileName, { type: uploadedFile.metadata.contentType });

                const exceptionDetails = {
                    response: "InvalidFileScanResult"
                };

                this.fileScanner.addOrUpdateFile(fileMetadata.id, fileMetadata, scan);

                this.logger?.failScenario(AMSFileManagerEvent.AMSDownload, {
                    ExceptionDetails: JSON.stringify(exceptionDetails)
                });

                return file;
            }

            try {
                blob = await this.amsClient.getView(fileMetadata, view_location, this.omnichannelChatToken, this.supportedImagesMimeTypes);  // eslint-disable-line @typescript-eslint/no-explicit-any
            } catch (error) {
                const exceptionDetails = {
                    response: 'AMSGetViewFailure',
                    errorObject: `${error}`
                };

                this.logger?.failScenario(AMSFileManagerEvent.AMSDownload, {
                    ExceptionDetails: JSON.stringify(exceptionDetails)
                });

                return undefined;
            }

            const file = new File([blob], uploadedFile.metadata.fileName, { type: uploadedFile.metadata.contentType });

            this.logger?.completeScenario(AMSFileManagerEvent.AMSDownload);

            return file;
        }
    }
}

export default AMSFileManager;