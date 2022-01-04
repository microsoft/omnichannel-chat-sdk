const createFormatIngressTagsMiddleware = (): CallableFunction => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatIngressTagsMiddleware = () => (next: any) => (activity: any) => {
        const patchedActivity = JSON.parse(JSON.stringify(activity));

        if (patchedActivity) {
            if (patchedActivity.channelData && patchedActivity.channelData.tags) {
                const { tags } = patchedActivity.channelData;
                if (typeof tags === 'string') {
                    try {
                        patchedActivity.channelData.tags = JSON.parse(tags); // Attempt to parse tags in JSON format
                    } catch {
                        patchedActivity.channelData.tags = tags.split(','); // Convert string to array
                    }
                }
            }
        }

        return next(patchedActivity);
    }

    return formatIngressTagsMiddleware;
}

export default createFormatIngressTagsMiddleware;