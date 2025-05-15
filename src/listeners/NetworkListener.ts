let isOffline = false;

let unsubscribe: (() => void) | undefined;

export async function enableNetworkListeners() {
    isOffline = false;

    if (typeof window !== "undefined" && window.addEventListener) {
        // Web
        window.addEventListener("offline", () => {
            console.warn("*********** Offline event triggered ************");
            isOffline = true;
        });

        window.addEventListener("online", () => {
            console.warn("************ Online event triggered ***************");
            isOffline = false;
        });
    } else {
        try {
            const NetInfo = (await import("@react-native-community/netinfo")).default;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            unsubscribe = NetInfo.addEventListener((state: any) => {
                isOffline = !state.isConnected;
            });
        } catch (e) {
            console.warn("NetInfo not available. Network events will not be handled.");
        }
    }
}

export function disableNetworkListeners() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = undefined;
    }
}

export function isNetworkOffline() {
    return isOffline;
}