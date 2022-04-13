
const locale = require('../../src/utils/locale');

describe('Locales', () => {
  it('locale.getLocaleStringFromId() should return correctly', () => {
    expect(locale.getLocaleStringFromId("1033")).toBe("en-us");
    expect(locale.getLocaleStringFromId(1033)).toBe("en-us");
    expect(locale.getLocaleStringFromId("1133")).toBe("en-us");
    expect(locale.getLocaleStringFromId("1058")).toBe("uk-ua");
    expect(locale.getLocaleStringFromId("")).toBe("en-us");
  });

  it('locale.getLocaleIdFromString() should return correctly', () => {
    expect(locale.getLocaleIdFromString("en-us")).toBe("1033");
    expect(locale.getLocaleIdFromString("en-uus")).toBe("1033");
    expect(locale.getLocaleIdFromString("")).toBe("1033");
    expect(locale.getLocaleIdFromString("zh-cn")).toBe("2052");
  });
});