/**
 * @jest-environment jsdom
 */

import platform from "../../src/utils/platform";

describe('Platform', () => {
    it('Platform should be Web if document object exists', () => {
        expect(platform.isBrowser()).toBe(true);
        expect(platform.isReactNative()).toBe(false);
    });
});
