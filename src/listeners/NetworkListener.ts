import platform from "../utils/platform";

let isOffline = false;

let unsubscribe: (() => void) | undefined;
let webOfflineHandler: (() => void) | undefined;
let webOnlineHandler: (() => void) | undefined;

export async function enableNetworkListeners() {
    disableNetworkListeners(); // trick to prevent multiple listeners from being added
    isOffline = false;

    console.warn("*********** Network listeners enabled ************");
    if (platform.isBrowser()) {
        console.warn("*********** Network listeners enabled for web ************");
        // Web
        webOfflineHandler = () => {
            console.warn("*********** Offline event triggered ************");
            isOffline = true;
        };
        webOnlineHandler = () => {
            console.warn("************ Online event triggered ***************");
            isOffline = false;
        };
        window.addEventListener("offline", webOfflineHandler);
        window.addEventListener("online", webOnlineHandler);
    } else {
        try {
            if (platform.isReactNative()) {
                console.warn("*********** Network listeners enabled for mobile ************");
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const NetInfo = require("@react-native-community/netinfo").default;
                unsubscribe = NetInfo.addEventListener((state: { isConnected: boolean | null }) => {
                    isOffline = !state.isConnected || state.isConnected === null;
                });
            }
        } catch (e) {
            console.warn("NetInfo not available. Network events will not be handled.", e);
        }
    }
}

export function disableNetworkListeners() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = undefined;
    }
    if (webOfflineHandler) {
        window.removeEventListener("offline", webOfflineHandler);
        webOfflineHandler = undefined;
    }
    if (webOnlineHandler) {
        window.removeEventListener("online", webOnlineHandler);
        webOnlineHandler = undefined;
    }
}

export function isNetworkOffline() {
    return isOffline;
}