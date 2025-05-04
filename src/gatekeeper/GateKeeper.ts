/* eslint-disable @typescript-eslint/no-explicit-any */

let isOffline = false;

export function gatekeeper(target: any, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
        console.log("Gatekeeper method called:", key, args);
        console.log("Current offline status:", isOffline);
        if (isOffline) {
            console.warn("Method called while offline:", key, args);
            throw new Error("Method cannot be called while offline.");
        }
        console.log("Method is online, proceeding:", key, args);
        const result = originalMethod.apply(this, args);
        return result;
    };
    return descriptor;
}

export function enableNetworkListeners() {
    window.addEventListener("offline", () => {
        console.warn("*********** Offline event triggered ************");
        isOffline = true;
    });

    window.addEventListener("online", () => {
        console.warn("************ Online event triggered ***************");
        isOffline = false;
    });
}

export function hey(){
    console.log("hello");
}