/**
 * @jest-environment jsdom
 */

import platform from "../../src/utils/platform";

describe('Platform', () => {
    it('Platform should be Web if document object exists', () => {
        const isBrowser = platform.isBrowser();
        expect(isBrowser).toBe(true);
    });
});
