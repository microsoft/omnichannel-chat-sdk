// Keep transport versions off the public message payload, including during rehydration.
const retainedMessageVersions = new WeakMap<object, string>();

export const getMessageVersion = (message: object): string | undefined => {
    const version = "version" in message ? message.version : retainedMessageVersions.get(message);
    if (typeof version !== "string" || !/^\d+$/.test(version)) {
        return undefined;
    }

    return version.replace(/^0+(?=\d)/, "");
};

export const retainMessageVersion = (message: object, source: object): void => {
    const version = getMessageVersion(source);
    if (version !== undefined) {
        retainedMessageVersions.set(message, version);
    }
};

export const isNewerMessageVersion = (version: string, previous?: string): boolean => {
    // ACS versions are UInt64 strings; Number would lose precision and BigInt would raise the runtime target.
    return previous === undefined
        || version.length > previous.length
        || (version.length === previous.length && version > previous);
};

export const isMessageEdited = (message: object): boolean => {
    return "editedOn" in message
        && message.editedOn instanceof Date
        && Number.isFinite(message.editedOn.getTime());
};

export class MessageUpdateTracker {
    private observedVersions = new Map<string, string>();
    private deliveredVersions = new Map<string, string>();

    public shouldDeliver(id: string, version: string): boolean {
        const observed = this.observedVersions.get(id);
        if (observed !== undefined && isNewerMessageVersion(observed, version)) {
            return false;
        }

        // Keep the latest observation even if a callback fails after partially updating its UI.
        this.observedVersions.set(id, version);
        return isNewerMessageVersion(version, this.deliveredVersions.get(id));
    }

    public markDelivered(id: string, version: string): void {
        if (isNewerMessageVersion(version, this.deliveredVersions.get(id))) {
            this.deliveredVersions.set(id, version);
        }
    }
}
