import AMSFileScanner from '../../../src/external/ACSAdapter/AMSFileScanner';
import activityUtils from '../../../src/external/ACSAdapter/activityUtils';
import WebUtils from '../../../src/utils/WebUtils';

describe("AMSFileScanner", () => {

    it("AMSFileScanner initialization should call AMSFileScanner.queueScan()", () => {
        (global as any).setTimeout = jest.fn();
        WebUtils.sleep = jest.fn();

        jest.spyOn(AMSFileScanner.prototype, 'queueScan');

        const amsClient: any = {};
        const fileScanner = new AMSFileScanner(amsClient);
        (fileScanner as any).shouldQueueScan = false;

        expect(AMSFileScanner.prototype.queueScan).toHaveBeenCalled();
    });

    it("AMSFileScanner.queueScan() should call AMSFileScanner.scanFiles()", async () => {
        (global as any).setTimeout = jest.fn();
        WebUtils.sleep = jest.fn();

        jest.spyOn(AMSFileScanner.prototype, 'queueScan');

        const amsClient: any = {};
        const fileScanner = new AMSFileScanner(amsClient);
        (fileScanner as any).test = true;

        fileScanner.scanFiles = jest.fn();
        await fileScanner.queueScan();

        expect(fileScanner.scanFiles).toHaveBeenCalledTimes(1);
    });

    it("AMSFileScanner.retrieveFileScanResult() of an existing scan result should return the scan result", async () => {
        (global as any).setTimeout = jest.fn();
        WebUtils.sleep = jest.fn();

        const amsClient: any = {};
        const fileScanner = new AMSFileScanner(amsClient);
        (fileScanner as any).test = true;

        fileScanner.scanFiles = jest.fn();

        const sampleFileId = "fileId";
        const sampleScanResult = {fileMetadata: {id: "id", type: "type"}, scan: {status: "status"}};
        fileScanner.scanResults?.set(sampleFileId, sampleScanResult);

        const scanResult = fileScanner.retrieveFileScanResult(sampleFileId);
        expect(scanResult).toEqual(sampleScanResult);
    });

    it("AMSFileScanner.addOrUpdateFile() should add a new scan result if not existing", async () => {
        (global as any).setTimeout = jest.fn();
        WebUtils.sleep = jest.fn();

        const amsClient: any = {};
        const fileScanner = new AMSFileScanner(amsClient);
        (fileScanner as any).test = true;

        fileScanner.scanFiles = jest.fn();

        const sampleFileId = "fileId";
        const sampleFileMetadata = {id: "id", type: "type"};
        const sampleScanResponse = {status: "status"};
        const initialSize = fileScanner.scanResults?.size;

        fileScanner.addOrUpdateFile(sampleFileId, sampleFileMetadata, sampleScanResponse);

        expect(initialSize).toBe(0);
        expect(fileScanner.scanResults?.size === 1).toBe(true);
    });

    it("AMSFileScanner.addOrUpdateFile() should update the scan result if existing", async () => {
        (global as any).setTimeout = jest.fn();
        WebUtils.sleep = jest.fn();

        const amsClient: any = {};
        const fileScanner = new AMSFileScanner(amsClient);
        (fileScanner as any).test = true;

        fileScanner.scanFiles = jest.fn();

        const sampleFileId = "fileId";
        const sampleFileMetadata = {id: "id", type: "type"};
        const sampleScanResponse = {status: "status"};
        const newSampleScanResponse = {status: "new status"}

        fileScanner.addOrUpdateFile(sampleFileId, sampleFileMetadata, sampleScanResponse);
        const initialScanResult = fileScanner.scanResults?.get(sampleFileId);

        fileScanner.addOrUpdateFile(sampleFileId, sampleFileMetadata, newSampleScanResponse);
        const newScanResult = fileScanner.scanResults?.get(sampleFileId);

        expect(fileScanner.scanResults?.size === 1).toBe(true);
        expect(initialScanResult).toEqual({fileMetadata: sampleFileMetadata, scan: sampleScanResponse});
        expect(newScanResult).toEqual({fileMetadata: sampleFileMetadata, scan: newSampleScanResponse});
    });

    it("AMSFileScanner.addNext() should fill the next property of the scan result", async () => {
        (global as any).setTimeout = jest.fn();
        WebUtils.sleep = jest.fn();

        const amsClient: any = {};
        const fileScanner = new AMSFileScanner(amsClient);
        (fileScanner as any).test = true;

        fileScanner.scanFiles = jest.fn();

        const sampleFileId = "fileId";
        const sampleScanResult = {fileMetadata: {id: "id", type: "type"}, scan: {status: "status"}};

        fileScanner.scanResults?.set(sampleFileId, sampleScanResult);

        const next = jest.fn();
        fileScanner.addNext(sampleFileId, next);

        const scanResult = fileScanner.scanResults?.get(sampleFileId);

        expect(fileScanner.scanResults?.size === 1).toBe(true);
        expect(scanResult).toEqual({...sampleScanResult, next});
        expect(scanResult?.next).toEqual(next);
    });

    it("AMSFileScanner.addActivity() should fill the activity property of the scan result", async () => {
        (global as any).setTimeout = jest.fn();
        WebUtils.sleep = jest.fn();

        const amsClient: any = {};
        const fileScanner = new AMSFileScanner(amsClient);
        (fileScanner as any).test = true;

        fileScanner.scanFiles = jest.fn();

        const sampleFileId = "fileId";
        const sampleScanResult = {fileMetadata: {id: "id", type: "type"}, scan: {status: "status"}};

        fileScanner.scanResults?.set(sampleFileId, sampleScanResult);

        const sampleActivity = {type: "message", attachments: [{contentType: "", name: "", thumbnailUrl: undefined}], channelData: {fileScan: [{status: "in progress"}]}};
        fileScanner.addActivity(sampleFileId, sampleActivity);

        const scanResult = fileScanner.scanResults?.get(sampleFileId);

        expect(fileScanner.scanResults?.size === 1).toBe(true);
        expect(scanResult).toEqual({...sampleScanResult, activity: sampleActivity});
        expect(scanResult?.activity).toEqual(sampleActivity);
    });

    it("AMSFileScanner.scanFileCallback() where file scan status returns 'malware' should update the activity via next(activity)", async () => {
        (global as any).setTimeout = jest.fn();
        WebUtils.sleep = jest.fn();

        const amsClient: any = {};
        const sampleViewStatusResponse = {
            view_location: "view_location",
            scan: {
                status: "malware"
            }
        };

        amsClient.getViewStatus = jest.fn(() => sampleViewStatusResponse);

        const fileScanner = new AMSFileScanner(amsClient);
        (fileScanner as any).test = true;

        const fileMetadata = {id: "id", type: "type", name: "name", size: 0};
        const attachment = {contentType: fileMetadata.type, name: fileMetadata.name, thumbnailUrl: undefined};
        const attachments = [attachment];
        const attachmentSizes = [fileMetadata.size];
        const scan = {status: "in progress"};
        const fileScan = [scan];

        const sampleFileId = "fileId";
        const sampleActivity = {type: "message", attachments, channelData: {fileScan, attachmentSizes}};
        const sampleNext = jest.fn();
        const sampleScanResult = {fileMetadata, scan, activity: sampleActivity, next: sampleNext};

        await fileScanner.scanFileCallback(sampleScanResult, sampleFileId);

        expect(sampleScanResult.next).toHaveBeenCalledWith(sampleScanResult.activity);
        expect(sampleScanResult.activity.channelData.fileScan).toEqual(fileScan);
        expect(sampleScanResult.activity.channelData.fileScan[0].status).toEqual(sampleViewStatusResponse.scan.status);
    });

    it("AMSFileScanner.scanFileCallback() where file scan status returns 'passed' should update the activity via next(activity)", async () => {
        const fileMetadata = {id: "id", type: "type", name: "name", size: 0};
        const attachment = {contentType: fileMetadata.type, name: fileMetadata.name, thumbnailUrl: undefined};

        (global as any).setTimeout = jest.fn();
        (global as any).File = jest.fn(() => fileMetadata);
        WebUtils.sleep = jest.fn();

        jest.spyOn(activityUtils, "getDataURL").mockResolvedValue(Promise.resolve(""));
        jest.spyOn(activityUtils, "getAttachments").mockResolvedValue(Promise.resolve([attachment]));

        const amsClient: any = {};
        const sampleViewStatusResponse = {
            view_location: "view_location",
            scan: {
                status: "passed"
            }
        };

        amsClient.getViewStatus = jest.fn(() => sampleViewStatusResponse);
        amsClient.getView = jest.fn();

        const fileScanner = new AMSFileScanner(amsClient);
        (fileScanner as any).test = true;

        jest.spyOn(fileScanner, "addOrUpdateFile");

        const attachments = [attachment];
        const attachmentSizes = [fileMetadata.size];
        const scan = {status: "in progress"};
        const fileScan = [scan];

        const sampleFileId = "fileId";
        const sampleActivity = {type: "message", attachments, channelData: {fileScan, attachmentSizes}};
        const sampleNext = jest.fn();
        const sampleScanResult = {fileMetadata, scan, activity: sampleActivity, next: sampleNext};

        await fileScanner.scanFileCallback(sampleScanResult, sampleFileId);

        expect(amsClient.getViewStatus).toHaveBeenCalled();
        expect(fileScanner.addOrUpdateFile).toHaveBeenCalledWith(sampleFileId, sampleScanResult.fileMetadata, sampleViewStatusResponse.scan);
        expect(amsClient.getView).toHaveBeenCalled();
        expect(sampleScanResult.next).toHaveBeenCalledWith(sampleScanResult.activity);
        expect(sampleScanResult.activity.channelData.fileScan).toEqual(fileScan);
        expect(sampleScanResult.activity.channelData.fileScan[0].status).toEqual(sampleViewStatusResponse.scan.status);
    });

    it("AMSFileScanner.end() should set internal attribute shouldQueueScan to false", () => {
        (global as any).setTimeout = jest.fn();
        WebUtils.sleep = jest.fn();

        const amsClient: any = {};
        const fileScanner = new AMSFileScanner(amsClient);
        (fileScanner as any).test = true;

        const beforeValue = (fileScanner as any).shouldQueueScan;
        fileScanner.end();

        const afterValue = (fileScanner as any).shouldQueueScan;

        expect(beforeValue).toBe(true);
        expect(afterValue).toBe(false);
    });
});
