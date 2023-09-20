import FileMetadata from "@microsoft/omnichannel-amsclient/lib/FileMetadata";
import FramedClient from "@microsoft/omnichannel-amsclient/lib/FramedClient";
import sleep from "../../utils/sleep";

interface FileScanResponse {
    status: string;
}

interface FileScanResult {
    fileMetadata: FileMetadata;
    scan: FileScanResponse;
    next?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    activity?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

enum AMSDownloadStatus {
    PASSED = "passed",
    MALWARE = "malware",
    INPROGRESS = "in progress"
}

const getDataURL = (file: File): Promise<string | ArrayBuffer> => {
    return new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
            resolve((fileReader as any).result); // eslint-disable-line @typescript-eslint/no-explicit-any
        };
        fileReader.readAsDataURL(file);
    });
}

const getAttachments = (files: File[]) => {
    return Promise.all(
        files.map(async (file: File) => {
            if (file) {
                const url = await getDataURL(file);
                return {
                    contentType: file.type,
                    contentUrl: url,
                    name: file.name,
                    thumbnailUrl: file.type.match("(image|video|audio).*") ? url: undefined
                }
            }
        })
    )
}

const getAttachmentSizes = (files: File[]) => {
    return files.map((file: File) => {
        return file.size;
    });
}

class AMSFileScanner {
    public amsClient: FramedClient;
    public scanResults: Map<string, FileScanResult> | null = null;

    constructor(amsClient: FramedClient) {
        this.amsClient = amsClient;
        this.scanResults = new Map<string, FileScanResult>();
        this.queueScan();
    }

    public addOrUpdateFile(id: string, fileMetadata: FileMetadata, scan: FileScanResponse): void {
        this.scanResults?.set(id, {
            fileMetadata,
            scan
        });
    }

    public async queueScan(): Promise<void> {
        const interval = 7 * 1000;

        try {
            await this.scanFiles();
        } catch (e) {
            console.error(e);
        } finally {
            await sleep(interval);
            await this.queueScan();
        }
    }

    public retrieveFileScanResult(id: string): FileScanResult | undefined {
        return this.scanResults?.get(id);
    }

    public addNext(id: string, next: Function): void {
        const scanResult = this.scanResults?.get(id);
        if (scanResult) {
            this.scanResults?.set(id, {...scanResult, next});
        }
    }

    public addActivity(id: string, activity: any): void {  // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        const scanResult = this.scanResults?.get(id);
        if (scanResult) {
            this.scanResults?.set(id, {...scanResult, activity});
        }
    }

    public scanFiles(): Promise<void> {
        const scan = async (scanResult: FileScanResult, id: string) => {
            const {fileMetadata, next, activity} = scanResult;

            if (scanResult?.scan?.status === AMSDownloadStatus.INPROGRESS) {
                try {
                    const response: any = await this.amsClient.getViewStatus(fileMetadata); // eslint-disable-line @typescript-eslint/no-explicit-any
                    const {view_location, scan} = response;

                    this.addOrUpdateFile(id, scanResult.fileMetadata, scan);
                    activity.channelData.fileScan = scan;

                    if (scan.status === AMSDownloadStatus.PASSED && next && activity) {
                        let blob: any; // eslint-disable-line @typescript-eslint/no-explicit-any
                        try {
                            blob = await this.amsClient.getView(fileMetadata, view_location); // eslint-disable-line @typescript-eslint/no-explicit-any
                        } catch (error) {
                            console.log(error);
                        }

                        const file = new File([blob], fileMetadata.name as string, { type: fileMetadata.type});
                        const attachmentData = await getAttachments([file]);
                        const attachmentSizes = await getAttachmentSizes([file]);

                        activity.attachments = attachmentData;
                        activity.channelData.attachmentSizes = attachmentSizes;
                        next(activity); // Send updated activity to webchat
                    }

                    if (scan.status === AMSDownloadStatus.MALWARE && next && activity) {
                        next(activity);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }

        this.scanResults?.forEach(async (scanResult, id) => {await scan(scanResult, id)});

        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve) => {
            this.scanResults?.forEach(async (scanResult, id) => {await scan(scanResult, id)});
            await sleep(1000);
            resolve();
        });
    }
}

export default AMSFileScanner;