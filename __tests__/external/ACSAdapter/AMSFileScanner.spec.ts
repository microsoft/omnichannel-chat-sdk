import AMSFileScanner from '../../../src/external/ACSAdapter/AMSFileScanner';

describe("AMSFileScanner", () => {

    it("AMSFileManager initialization should call setTimeout()", () => {
        (global as any).setTimeout = jest.fn();

        const amsClient: any = {};
        new AMSFileScanner(amsClient);

        expect((global as any).setTimeout).toHaveBeenCalled();
    });
});
