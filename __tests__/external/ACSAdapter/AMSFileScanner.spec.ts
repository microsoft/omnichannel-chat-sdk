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
});
