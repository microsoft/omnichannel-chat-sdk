import AMSFileScanner from '../../../src/external/ACSAdapter/AMSFileScanner';

describe("AMSFileScanner", () => {

    it("AMSFileScanner initialization should call setTimeout()", () => {
        (global as any).setTimeout = jest.fn();

        const amsClient: any = {};
        new AMSFileScanner(amsClient);

        expect((global as any).setTimeout).toHaveBeenCalled();
    });

    it("AMSFileScanner.queueScan() should call AMSFileScanner.scanFiles()", async () => {
        (global as any).setTimeout = jest.fn();
        const amsClient: any = {};
        const fileScanner = new AMSFileScanner(amsClient);

        fileScanner.scanFiles = jest.fn();
        fileScanner.queueScan();

        expect((global as any).setTimeout).toHaveBeenCalled();
        expect(fileScanner.scanFiles).toHaveBeenCalledTimes(1);
    });

    it("AMSFileScanner.retrieveFileScanResult() of an existing scan result should return the scan result", async () => {
        (global as any).setTimeout = jest.fn();
        const amsClient: any = {};
        const fileScanner = new AMSFileScanner(amsClient);

        fileScanner.scanFiles = jest.fn();

        const sampleFileId = "fileId";
        const sampleScanResult = {fileMetadata: {id: "id", type: "type"}, scan: {status: "status"}};
        fileScanner.scanResults?.set(sampleFileId, sampleScanResult);

        const scanResult = fileScanner.retrieveFileScanResult(sampleFileId);
        expect(scanResult).toEqual(sampleScanResult);
    });

    it("AMSFileScanner.addOrUpdateFile() should add a new scan result if not existing", async () => {
        (global as any).setTimeout = jest.fn();
        const amsClient: any = {};
        const fileScanner = new AMSFileScanner(amsClient);

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
        const amsClient: any = {};
        const fileScanner = new AMSFileScanner(amsClient);

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
        const amsClient: any = {};
        const fileScanner = new AMSFileScanner(amsClient);

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
});
