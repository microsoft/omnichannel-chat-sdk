/**
 * @jest-environment node
 */

import platform from "../../src/utils/platform";

describe('Platform', () => {
    it('Platform should be Node if a node version exists', () => {
        const isNode = platform.isNode();
        expect(isNode).toBe(true);
    });

    it('Platform should be React Native if a node version exists', () => {
        (global as any).navigator = {};
        (global.navigator as any).product = 'ReactNative';

        expect(platform.isReactNative()).toBe(true);
        expect(platform.isBrowser()).toBe(false)
    });

    afterEach(() => {
        if (global.navigator) {
            (global as any).navigator = undefined;
        }
    });
});
