import FileMetadata from "@microsoft/omnichannel-amsclient/lib/FileMetadata";
import FramedClient from "@microsoft/omnichannel-amsclient/lib/FramedClient";
import sleep from "../../utils/sleep";
import { AMSViewScanStatus, defaultScanInterval } from "./AMSFileManager";
import activityUtils from "./activityUtils";

interface FileScanResponse {
    status: string;
}

interface FileScanResult {
    fileMetadata: FileMetadata;
    scan: FileScanResponse;
    next?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    activity?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

class AMSFileScanner {
    public amsClient: FramedClient;
    public scanResults: Map<string, FileScanResult> | null = null;
    public interval: number = defaultScanInterval;
    private shouldQueueScan: boolean;

    constructor(amsClient: FramedClient, interval: number = defaultScanInterval) {
        this.amsClient = amsClient;
        this.scanResults = new Map<string, FileScanResult>();
        this.interval = interval;
        this.shouldQueueScan = false;
        this.queueScan();
    }

    public async queueScan(): Promise<void> {
        this.shouldQueueScan = true;

        try {
            await this.scanFiles();
        } catch (e) {
            console.error(e);
        } finally {
            await sleep(this.interval);
            this.shouldQueueScan && await this.queueScan();
        }
    }

    public retrieveFileScanResult(id: string): FileScanResult | undefined {
        return this.scanResults?.get(id);
    }

    public addOrUpdateFile(id: string, fileMetadata: FileMetadata, scan: FileScanResponse): void {
        const scanResult = this.retrieveFileScanResult(id);
        this.scanResults?.set(id, {
            ...(scanResult || {}),
            fileMetadata,
            scan
        });
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

    public async scanFileCallback(scanResult: FileScanResult, id: string): Promise<void> {
        const {fileMetadata, next, activity} = scanResult;

        if (scanResult?.scan?.status === AMSViewScanStatus.INPROGRESS) {
            try {
                const response: any = await this.amsClient.getViewStatus(fileMetadata); // eslint-disable-line @typescript-eslint/no-explicit-any
                const {view_location, scan} = response;

                this.addOrUpdateFile(id, scanResult.fileMetadata, scan);

                if (scan.status === AMSViewScanStatus.PASSED && next && activity) {
                    let blob: any; // eslint-disable-line @typescript-eslint/no-explicit-any
                    try {
                        blob = await this.amsClient.getView(fileMetadata, view_location); // eslint-disable-line @typescript-eslint/no-explicit-any
                    } catch (error) {
                        console.error(error);
                    }

                    const file = new File([blob], fileMetadata.name as string, { type: fileMetadata.type});
                    const attachmentData = await activityUtils.getAttachments([file]);
                    const attachmentSizes = await activityUtils.getAttachmentSizes([file]);

                    const index = activity.attachments.findIndex((attachment: any) => (attachment.name === fileMetadata.name)); // eslint-disable-line @typescript-eslint/no-explicit-any
                    activity.channelData.fileScan[index] = scan;
                    activity.attachments[index] = attachmentData[0];
                    activity.channelData.attachmentSizes[index] = attachmentSizes[0];

                    const hasMultipleAttachments = index > 0;
                    if (hasMultipleAttachments) {
                        const {metadata: {amsreferences}} = activity.channelData;
                        const fileIds = JSON.parse(amsreferences);
                        fileIds.forEach((fileId: string) => {
                            this.addActivity(fileId, activity);
                        });
                    }

                    next(activity); // Send updated activity to webchat
                }

                if (scan.status === AMSViewScanStatus.MALWARE && next && activity) {
                    const index = activity.attachments.findIndex((attachment: any) => (attachment.name === fileMetadata.name)); // eslint-disable-line @typescript-eslint/no-explicit-any
                    activity.channelData.fileScan[index] = scan;
                    next(activity);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    public scanFiles(): Promise<void> {
        this.scanResults?.forEach(async (scanResult, id) => {await this.scanFileCallback(scanResult, id)});

        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve) => {
            this.scanResults?.forEach(async (scanResult, id) => {await this.scanFileCallback(scanResult, id)});
            await sleep(1000);
            resolve();
        });
    }

    public end(): void {
        this.shouldQueueScan = false;
    }
}

export default AMSFileScanner;