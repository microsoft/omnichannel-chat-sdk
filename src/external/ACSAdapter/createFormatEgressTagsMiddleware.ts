const createFormatEgressTagsMiddleware = (): CallableFunction => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatEgressTagsMiddleware = () => (next: any) => (activity: any) => {
        const patchedActivity = JSON.parse(JSON.stringify(activity));
        if (patchedActivity) {
            if (patchedActivity.channelData && patchedActivity.channelData.tags) {
                const { tags } = patchedActivity.channelData;
                if (typeof tags === 'string') {
                    return next(activity);
                } else if (tags instanceof Array) {
                    patchedActivity.channelData.tags = tags.toString();
                } else if (typeof patchedActivity.channelData.tags === 'object') {
                    try {
                        patchedActivity.channelData.tags = JSON.stringify(tags);
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        }

        return next(patchedActivity);
    }

    return formatEgressTagsMiddleware;
}

export default createFormatEgressTagsMiddleware;