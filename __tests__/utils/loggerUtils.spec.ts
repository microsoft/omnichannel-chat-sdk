import { redactPII, redactSecrets, redactedSecretPlaceholder } from '../../src/utils/loggerUtils';

const base64Url = (value: object): string => Buffer.from(JSON.stringify(value)).toString("base64url");
const fakeJwt = `${base64Url({alg: "none", typ: "JWT"})}.${base64Url({sub: "test"})}.signature`;

describe('loggerUtils', () => {
    describe('redactSecrets', () => {
        it('should redact a JWT anywhere in the value', () => {
            expect(redactSecrets(`token ${fakeJwt} end`)).toBe(`token ${redactedSecretPlaceholder} end`);
        });

        it('should redact sensitive query parameter values and keep the rest of the URL', () => {
            expect(redactSecrets("https://contoso.blob.core.windows.net/c/f?sv=2022&sig=abc%2Fdef&se=2026")).toBe(`https://contoso.blob.core.windows.net/c/f?sv=2022&sig=${redactedSecretPlaceholder}&se=2026`);
            expect(redactSecrets("https://support.microsoft.com/files?workspace=opaque-value&wid=123")).toBe(`https://support.microsoft.com/files?workspace=${redactedSecretPlaceholder}&wid=123`);
            expect(redactSecrets("https://host/cb?code=abc&state=xyz")).toBe(`https://host/cb?code=${redactedSecretPlaceholder}&state=xyz`);
            expect(redactSecrets("https://host/t?client_secret=abc&x=1")).toBe(`https://host/t?client_secret=${redactedSecretPlaceholder}&x=1`);
            expect(redactSecrets("https://host/t?a=1&pwd=abc")).toBe(`https://host/t?a=1&pwd=${redactedSecretPlaceholder}`);
            expect(redactSecrets("https://host/t?passwd=abc")).toBe(`https://host/t?passwd=${redactedSecretPlaceholder}`);
        });

        it('should redact credentials in percent-encoded and HTML-escaped links', () => {
            const safeLink = `https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fsupport.microsoft.com%2Ffiles%3Fworkspace%3D${fakeJwt}%26wid%3D1&data=05`;
            expect(redactSecrets(safeLink)).toBe(`https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fsupport.microsoft.com%2Ffiles%3Fworkspace%3D${redactedSecretPlaceholder}%26wid%3D1&data=05`);
            expect(redactSecrets(`Authorization%3A%20Bearer%20${fakeJwt}`)).toBe(`Authorization%3A%20Bearer%20${redactedSecretPlaceholder}`);
            expect(redactSecrets("https%3A%2F%2Fhost%2Fcb%3Fcode%3Dabc123%26state%3Dxyz")).toBe(`https%3A%2F%2Fhost%2Fcb%3Fcode%3D${redactedSecretPlaceholder}%26state%3Dxyz`);
            expect(redactSecrets("<a href=\"https://host/f?sv=1&amp;sig=abc123&amp;se=2\">")).toBe(`<a href="https://host/f?sv=1&amp;sig=${redactedSecretPlaceholder}&amp;se=2">`);
        });

        it('should redact sensitive URL fragment parameters', () => {
            expect(redactSecrets("https://host/cb#access_token=opaque&token_type=Bearer")).toBe(`https://host/cb#access_token=${redactedSecretPlaceholder}&token_type=Bearer`);
        });

        it('should process adversarial input in linear time', () => {
            for (const unit of ["eyJ", "-eyJ", ".eyJ", "%3DeyJ", "a.eyJab."]) {
                const start = Date.now();
                redactSecrets(unit.repeat(30000));
                expect(Date.now() - start).toBeLessThan(500);
            }
        });

        it('should leave values without credentials unchanged', () => {
            const url = "https://12345678-occhannels-acs.australia.communication.azure.com/chat/threads/19%3A123456%40thread.v2/messages?api-version=2021-09-07&startTime=2025-01-27T01%3A56%3A54.000Z";
            expect(redactSecrets(url)).toBe(url);
            expect(redactSecrets("https://host/cb#token_type=Bearer&country_code=US")).toBe("https://host/cb#token_type=Bearer&country_code=US");
            expect(redactSecrets("ACS Adapter: convert normal message")).toBe("ACS Adapter: convert normal message");
            expect(redactSecrets("")).toBe("");
        });
    });

    describe('redactPII', () => {
        it('should mask OriginalMessageText regardless of key casing', () => {
            const result = redactPII({ metadata: { originalMessageText: "Hello world" } }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
            expect(result.metadata.originalMessageText).toBe("H**10 hidden**");
        });

        it('should redact credentials in a top-level string', () => {
            expect(redactPII(`Bearer ${fakeJwt}`)).toBe(`Bearer ${redactedSecretPlaceholder}`);
        });

        it('should mask PII values that are JSON primitives', () => {
            const result = redactPII({ message: '"my password is hunter2"', metadata: { OriginalMessageText: "4111111111111111" } }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
            expect(result.message).toBe('"**23 hidden**');
            expect(result.metadata.OriginalMessageText).toBe("4**15 hidden**");
        });

        it('should redact credentials in JSON string values', () => {
            expect(redactPII(JSON.stringify(`see https://host/p?workspace=${fakeJwt}`))).toBe(`see https://host/p?workspace=${redactedSecretPlaceholder}`);
            const result = redactPII({ note: JSON.stringify(`see ${fakeJwt}`) }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
            expect(result.note).toBe(`see ${redactedSecretPlaceholder}`);
        });

        it('should redact credentials in nested values and arrays outside known PII keys', () => {
            const result = redactPII({ items: [{ link: `https://host/p?access_token=${fakeJwt}` }] }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
            expect(result.items[0].link).toBe(`https://host/p?access_token=${redactedSecretPlaceholder}`);
        });

        it('should mask PII keys inside doubly-encoded JSON', () => {
            const payload = { message: "hello world", metadata: { OriginalMessageText: "Hello world" } };
            const result = redactPII({ details: JSON.stringify(JSON.stringify(payload)) }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
            expect(result.details).toEqual({ message: "h**10 hidden**", metadata: { OriginalMessageText: "H**10 hidden**" } });
            expect(redactPII(JSON.stringify(JSON.stringify(payload)))).toEqual(result.details);
        });

        it('should not modify the original input', () => {
            const input = { metadata: { OriginalMessageText: "Hello world" } };
            redactPII(input);
            expect(input.metadata.OriginalMessageText).toBe("Hello world");
        });
    });
});
