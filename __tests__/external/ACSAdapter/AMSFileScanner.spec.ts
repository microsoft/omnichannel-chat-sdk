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
        const amsClient: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
        const fileScanner = new AMSFileScanner(amsClient);

        fileScanner.scanFiles = jest.fn();
        fileScanner.queueScan();

        expect((global as any).setTimeout).toHaveBeenCalled();
        expect(fileScanner.scanFiles).toHaveBeenCalledTimes(1);
    });

    it("AMSFileScanner.retrieveFileScanResult() of an existing scan result should return the scan result", async () => {
        (global as any).setTimeout = jest.fn();
        const amsClient: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
        const fileScanner = new AMSFileScanner(amsClient);

        fileScanner.scanFiles = jest.fn();

        const sampleFileId = "fileId";
        const sampleScanResult = {fileMetadata: {id: "id", type: "type"}, scan: {status: "status"}};
        fileScanner.scanResults?.set(sampleFileId, sampleScanResult);

        const scanResult = fileScanner.retrieveFileScanResult(sampleFileId);
        expect(scanResult).toEqual(sampleScanResult);
    });
});
