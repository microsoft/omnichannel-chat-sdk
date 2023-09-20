import createFileScanIngressMiddleware from "../../../src/external/ACSAdapter/createFileScanIngressMiddleware";

describe('createFileScanIngressMiddleware', () => {
    it('createFileScanIngressMiddleware should call next if activity has no attachments', () => {
        const next = jest.fn();
        const activity = {};

        createFileScanIngressMiddleware()()(next)(activity);

        expect(next).toHaveBeenCalledWith(activity);
    });
});