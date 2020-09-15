export const isBrowser = () => typeof window !== 'undefined' && typeof window.document !== 'undefined';
export const isNode = () => typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
export const isReactNative = () => typeof navigator != 'undefined' && navigator.product == 'ReactNative';

export default {
    isBrowser,
    isNode,
    isReactNative
}