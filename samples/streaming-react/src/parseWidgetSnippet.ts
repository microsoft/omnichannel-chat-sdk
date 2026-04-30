// Parses a Microsoft Contact Center chat widget snippet (the <script> tag
// customers copy from the OC admin app) into the three values the SDK needs:
// widgetId (from data-app-id), orgId (from data-org-id), orgUrl (from data-org-url).
//
// Handles two formats found in real snippets:
//   1. Inline script element with the data-* attributes.
//   2. Same script element but with a fallback onerror handler that re-creates
//      the script and sets the attributes via setAttribute('data-app-id', '...').
// We try DOMParser first (robust for #1), then fall back to regex (covers #2).

export interface WidgetConfig {
    widgetId: string;
    orgId: string;
    orgUrl: string;
}

export type ParseResult =
    | { ok: true; config: WidgetConfig }
    | { ok: false; error: string };

const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const URL_PATTERN = /^https?:\/\/[^\s]+/i;

export function parseWidgetSnippet(snippet: string): ParseResult {
    const trimmed = snippet.trim();
    if (!trimmed) {
        return { ok: false, error: 'Paste a widget snippet to continue.' };
    }

    let widgetId: string | undefined;
    let orgId: string | undefined;
    let orgUrl: string | undefined;

    // 1. Try DOM parsing — picks up data-* attributes on script elements.
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(trimmed, 'text/html');
        const script = doc.querySelector('script[data-app-id], script[data-org-id], script[data-org-url]');
        if (script) {
            widgetId = script.getAttribute('data-app-id') ?? undefined;
            orgId = script.getAttribute('data-org-id') ?? undefined;
            orgUrl = script.getAttribute('data-org-url') ?? undefined;
        }
    } catch {
        // fall through to regex
    }

    // 2. Regex fallback — handles attributes only present inside the onerror
    // setAttribute calls, plus catches malformed snippets DOMParser may miss.
    widgetId = widgetId ?? extractAttribute(trimmed, 'data-app-id');
    orgId = orgId ?? extractAttribute(trimmed, 'data-org-id');
    orgUrl = orgUrl ?? extractAttribute(trimmed, 'data-org-url');

    const missing = [
        !widgetId && 'data-app-id',
        !orgId && 'data-org-id',
        !orgUrl && 'data-org-url',
    ].filter(Boolean) as string[];

    if (missing.length > 0) {
        return {
            ok: false,
            error: `Snippet is missing required attributes: ${missing.join(', ')}. Make sure you copied the full <script> tag from the OC admin app.`,
        };
    }

    if (!GUID_PATTERN.test(widgetId!)) {
        return { ok: false, error: `data-app-id is not a valid GUID: "${widgetId}".` };
    }
    if (!GUID_PATTERN.test(orgId!)) {
        return { ok: false, error: `data-org-id is not a valid GUID: "${orgId}".` };
    }
    if (!URL_PATTERN.test(orgUrl!)) {
        return { ok: false, error: `data-org-url is not a valid URL: "${orgUrl}".` };
    }

    return {
        ok: true,
        config: {
            widgetId: widgetId!,
            orgId: orgId!,
            orgUrl: orgUrl!,
        },
    };
}

// Extract a data-* attribute value from raw snippet text. Tries two patterns:
//   1. data-name="value" or data-name='value'  (inline attribute)
//   2. 'data-name', 'value' or "data-name", "value"  (setAttribute call inside onerror)
function extractAttribute(snippet: string, name: string): string | undefined {
    const patterns = [
        new RegExp(`${escapeRegex(name)}\\s*=\\s*["']([^"']+)["']`, 'i'),
        new RegExp(`['"]${escapeRegex(name)}['"]\\s*,\\s*['"]([^'"]+)['"]`, 'i'),
    ];
    for (const pattern of patterns) {
        const match = snippet.match(pattern);
        if (match) return match[1];
    }
    return undefined;
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
