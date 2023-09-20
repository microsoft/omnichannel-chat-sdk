const createFileScanIngressMiddleware = (): CallableFunction => {
    const fileScanIngressMiddleware = () => (next: any) => async (activity: any) => {  // eslint-disable-line @typescript-eslint/no-explicit-any
        const {attachments, channelData} = activity;
        if (!attachments) {
            return next(activity);
        }

        // Patch references
        if (!channelData?.metadata?.amsreferences && channelData?.metadata?.amsReferences) {
            activity.channelData.metadata.amsreferences = channelData.metadata.amsReferences;
        }

        const {metadata: {amsreferences}} = channelData;

        if (amsreferences) {
            try {
                const scanFile = (fileId: string) => {
                    const { fileScanner } = (window as any).chatAdapter.fileManager;  // eslint-disable-line @typescript-eslint/no-explicit-any

                    if (!fileScanner) {
                        return next(activity);
                    }

                    const scanResult = fileScanner.retrieveFileScanResult(fileId);
                    if (scanResult) {
                        const {scan, fileMetadata} = scanResult;
                        const index = activity.attachments.findIndex((attachment: any) => (attachment.name === fileMetadata.name)); // eslint-disable-line @typescript-eslint/no-explicit-any

                        if (!activity.channelData.fileScan) {
                            activity.channelData.fileScan = [];
                        }

                        activity.channelData.fileScan[index] = scan;
                    }

                    fileScanner.addNext(fileId, next);
                    fileScanner.addActivity(fileId, {...activity});
                };

                const fileIds = JSON.parse(amsreferences);
                fileIds.forEach((fileId: string) => scanFile(fileId));
            } catch (e) {
                console.error(e);
            }
        }

        return next(activity);
    }

    return fileScanIngressMiddleware;
}

export default createFileScanIngressMiddleware;