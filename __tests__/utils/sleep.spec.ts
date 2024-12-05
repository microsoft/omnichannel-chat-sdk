import sleep from "../../src/utils/sleep";

describe('Sleep', () => {
    it('sleep() should delay function execution', async () => {
        const delay = 5 * 1000;
        const threshold = delay * (50 / 100);
        const before = new Date().getTime();
        await sleep(delay);
        const after = new Date().getTime();
        const difference = after - before;
        const lowerBound = delay - threshold;
        const upperbound = delay + threshold;

        expect(difference >= lowerBound && difference <= upperbound).toBe(true);
    }, 10 * 1000);
});