export const isBrowser = (): boolean => typeof window !== 'undefined' && typeof window.document !== 'undefined';
export const isNode = (): boolean => typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
export const isReactNative = (): boolean => typeof navigator != 'undefined' && navigator.product == 'ReactNative';

export default {
    isBrowser,
    isNode,
    isReactNative
}