const createFileScanIngressMiddleware = (): CallableFunction => {
    const fileScanIngressMiddleware = () => (next: any) => async (activity: any) => {  // eslint-disable-line @typescript-eslint/no-explicit-any
        const {attachments, channelData} = activity;
        if (!attachments) {
            return next(activity);
        }

        // Patch references
        if (!channelData?.metadata?.amsreferences && channelData?.metadata?.amsReferences) {
            channelData.metadata.amsreferences = channelData.metadata.amsReferences;
        }

        const {metadata: {amsreferences}} = channelData;

        if (amsreferences) {
            try {
                const fileId = JSON.parse(amsreferences)[0];
                const { fileScanner } = (window as any).chatAdapter.fileManager;  // eslint-disable-line @typescript-eslint/no-explicit-any
                const scanResult = fileScanner.retrieveFileScanResult(fileId);

                if (scanResult) {
                    const {scan} = scanResult;
                    activity.channelData.fileScan = scan;
                }

                fileScanner.addNext(fileId, next);
                fileScanner.addActivity(fileId, activity);
            } catch (e) {
                console.error(e);
            }
        }

        return next(activity);
    }

    return fileScanIngressMiddleware;
}

export default createFileScanIngressMiddleware;