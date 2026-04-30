// Local-only persistence for one customer's widget config. No server, no
// telemetry, no syncing — just localStorage in the user's own browser.

import type { WidgetConfig } from './parseWidgetSnippet';

const STORAGE_KEY = 'oc-streaming-demo-config-v1';

export interface StoredConfig extends WidgetConfig {
    savedAt: string;  // ISO timestamp
}

export function loadSavedConfig(): StoredConfig | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<StoredConfig>;
        if (parsed && parsed.widgetId && parsed.orgId && parsed.orgUrl && parsed.savedAt) {
            return parsed as StoredConfig;
        }
    } catch {
        // Corrupt JSON or storage unavailable — treat as no saved config.
    }
    return null;
}

export function saveConfig(config: WidgetConfig): void {
    const stored: StoredConfig = {
        ...config,
        savedAt: new Date().toISOString(),
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
        // Storage unavailable (quota, private browsing) — silently skip persistence.
    }
}

export function clearSavedConfig(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Best-effort.
    }
}
