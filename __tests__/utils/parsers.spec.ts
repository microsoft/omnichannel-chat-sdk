const parsers = require('../../src/utils/parsers');

describe('Parsers', () => {
    it('parsers.parseLowerCaseString() of a boolean value true should return "true"', () => {
        const input = true;
        const expectedResult = "true";
        const result = parsers.parseLowerCaseString(input);

        expect(result).toBe(expectedResult);
    });

    it('parsers.parseLowerCaseString() of a boolean value false should return "false"', () => {
        const input = false;
        const expectedResult = "false";
        const result = parsers.parseLowerCaseString(input);

        expect(result).toBe(expectedResult);
    });

    it('parsers.parseLowerCaseString() of a string value "True" should return "true"', () => {
        const input = "True";
        const expectedResult = "true";
        const result = parsers.parseLowerCaseString(input);

        expect(result).toBe(expectedResult);
    });

    it('parsers.parseLowerCaseString() of a string value "False" should return "false"', () => {
        const input = "False";
        const expectedResult = "false";
        const result = parsers.parseLowerCaseString(input);

        expect(result).toBe(expectedResult);
    });

    it('parsers.parseLowerCaseString() of a string value "true" should return "true"', () => {
        const input = "true";
        const expectedResult = "true";
        const result = parsers.parseLowerCaseString(input);

        expect(result).toBe(expectedResult);
    });

    it('parsers.parseLowerCaseString() of a string value "false" should return "false"', () => {
        const input = "false";
        const expectedResult = "false";
        const result = parsers.parseLowerCaseString(input);

        expect(result).toBe(expectedResult);
    });
});