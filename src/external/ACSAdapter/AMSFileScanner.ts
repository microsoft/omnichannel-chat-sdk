import FileMetadata from "@microsoft/omnichannel-amsclient/lib/FileMetadata";
import FramedClient from "@microsoft/omnichannel-amsclient/lib/FramedClient";
import WebUtils from "../../utils/WebUtils";
import { AMSViewScanStatus } from "./AMSFileManager";
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

const defaultScanPollingInterval = 7 * 1000;
const defaultScanStatusRetrievalDelay = 1000;

interface AMSFileScannerOptions {
    pollingInterval?: number;
    scanStatusRetrievalDelay?: number;
}

class AMSFileScanner {
    public amsClient: FramedClient;
    public scanResults: Map<string, FileScanResult> | null = null;
    private shouldQueueScan: boolean;
    private test: boolean;
    private options: AMSFileScannerOptions;

    constructor(amsClient: FramedClient, options: AMSFileScannerOptions = {}) {
        this.amsClient = amsClient;
        this.scanResults = new Map<string, FileScanResult>();
        this.shouldQueueScan = false;
        this.test = false;
        this.options = options;
        this.queueScan();
    }

    public async queueScan(): Promise<void> {
        this.shouldQueueScan = true;
        try {
            await this.scanFiles();
        } catch (e) {
            console.error(e);
        } finally {
            await WebUtils.sleep(this.options?.pollingInterval || defaultScanPollingInterval);
            this.shouldQueueScan && !this.test && await this.queueScan();
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
        const {fileMetadata, next, activity, scan} = scanResult;

        if (scan?.status === AMSViewScanStatus.INPROGRESS) {
            try {
                const response: any = await this.amsClient.getViewStatus(fileMetadata); // eslint-disable-line @typescript-eslint/no-explicit-any
                const {view_location, scan} = response;

                this.addOrUpdateFile(id, scanResult.fileMetadata, scan);

                if (scan.status === AMSViewScanStatus.PASSED && next && activity) {
                   await this.renderAttachmentActivity(scanResult, view_location);
                }

                if (scan.status === AMSViewScanStatus.MALWARE && next && activity) {
                    await this.renderMalwareActivity(scanResult);
                }
            } catch (e) {
                console.error(e);
            }

            await WebUtils.sleep(this.options?.scanStatusRetrievalDelay || defaultScanStatusRetrievalDelay);
        }
    }

    public scanFiles(): Promise<void> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve) => {
            this.scanResults?.forEach(async (scanResult, id) => {await this.scanFileCallback(scanResult, id)});
            resolve();
        });
    }

    public end(): void {
        this.shouldQueueScan = false;
    }

    private async retrieveFileBlob(fileMetadata: FileMetadata, view_location: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        let blob: any; // eslint-disable-line @typescript-eslint/no-explicit-any

        try {
            blob = await this.amsClient.getView(fileMetadata, view_location); // eslint-disable-line @typescript-eslint/no-explicit-any
        } catch (error) {
            console.error(error);
        }

        return blob;
    }

    private async addAttachmentToActivity(activity: any, file: File) { // eslint-disable-line @typescript-eslint/no-explicit-any
        const attachmentData = await activityUtils.getAttachments([file]);
        const attachmentSizes = await activityUtils.getAttachmentSizes([file]);
        const index = activity.attachments.findIndex((attachment: any) => (attachment.name === file.name)); // eslint-disable-line @typescript-eslint/no-explicit-any
        activity.attachments[index] = attachmentData[0];
        activity.channelData.attachmentSizes[index] = attachmentSizes[0];
    }

    public async renderAttachmentActivity(scanResult: FileScanResult, view_location: any): Promise<void> { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        const {fileMetadata, next, activity} = scanResult;
        const blob = await this.retrieveFileBlob(fileMetadata, view_location);
        const file = new File([blob], fileMetadata.name as string, { type: fileMetadata.type});

        await this.addAttachmentToActivity(activity, file);

        const index = activity.attachments.findIndex((attachment: any) => (attachment.name === file.name)); // eslint-disable-line @typescript-eslint/no-explicit-any
        activity.channelData.fileScan[index] = {status: AMSViewScanStatus.PASSED};

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

    public async renderMalwareActivity(scanResult: FileScanResult): Promise<void> { // eslint-disable-line @typescript-eslint/no-explicit-any
        const {fileMetadata, next, activity} = scanResult;
        const index = activity.attachments.findIndex((attachment: any) => (attachment.name === fileMetadata.name)); // eslint-disable-line @typescript-eslint/no-explicit-any
        activity.channelData.fileScan[index] = {status: AMSViewScanStatus.MALWARE};
        next(activity);
    }
}

export default AMSFileScanner;