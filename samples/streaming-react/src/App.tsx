import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
    OmnichannelChatSDK,
    OmnichannelStreamingMessage,
} from '@microsoft/omnichannel-chat-sdk';

import { parseWidgetSnippet, WidgetConfig } from './parseWidgetSnippet';
import { loadSavedConfig, saveConfig, clearSavedConfig, StoredConfig } from './storage';

// ============================================================================
// Types
// ============================================================================

interface BubbleState {
    id: string;
    sender: 'user' | 'agent' | 'bot' | 'system';
    senderDisplayName?: string;
    content: string;
    isStreaming: boolean;
    streamPhase?: string;
    streamEndReason?: string;
    timestamp: Date;
}

interface EventLogEntry {
    id: string;
    source: 'onNewMessage' | 'onStreamingMessage' | 'sendMessage' | 'lifecycle';
    phase?: string;
    sequenceNumber?: number;
    messageId?: string;
    contentPreview?: string;
    timestamp: Date;
}

type ChatError =
    | { kind: 'cors'; message: string; originToAdd: string }
    | { kind: 'other'; message: string };

// ============================================================================
// Top-level App — orchestrates setup vs chat mode
// ============================================================================

const App: React.FC = () => {
    const [savedConfig, setSavedConfig] = useState<StoredConfig | null>(() => loadSavedConfig());
    const [activeConfig, setActiveConfig] = useState<WidgetConfig | null>(null);

    if (!activeConfig) {
        return (
            <SetupScreen
                savedConfig={savedConfig}
                onStart={(config, remember) => {
                    if (remember) {
                        saveConfig(config);
                        setSavedConfig({ ...config, savedAt: new Date().toISOString() });
                    }
                    setActiveConfig(config);
                }}
                onClearStorage={() => {
                    clearSavedConfig();
                    setSavedConfig(null);
                }}
            />
        );
    }

    return (
        <ChatScreen
            config={activeConfig}
            onSwitchCustomer={() => setActiveConfig(null)}
            onClearStorage={() => {
                clearSavedConfig();
                setSavedConfig(null);
            }}
        />
    );
};

// ============================================================================
// SetupScreen — paste, parse, extract preview, CORS guidance, start
// ============================================================================

const SetupScreen: React.FC<{
    savedConfig: StoredConfig | null;
    onStart: (config: WidgetConfig, remember: boolean) => void;
    onClearStorage: () => void;
}> = ({ savedConfig, onStart, onClearStorage }) => {
    const [snippet, setSnippet] = useState('');
    const [remember, setRemember] = useState(true);
    const [originCopied, setOriginCopied] = useState(false);

    const parseResult = useMemo(() => parseWidgetSnippet(snippet), [snippet]);
    const isValid = parseResult.ok;

    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

    const useSavedConfig = () => {
        if (!savedConfig) return;
        // Reconstruct a minimal snippet so the textarea reflects the loaded values
        const reconstructed = `<script id="Microsoft_Omnichannel_LCWidget" data-app-id="${savedConfig.widgetId}" data-org-id="${savedConfig.orgId}" data-org-url="${savedConfig.orgUrl}"></script>`;
        setSnippet(reconstructed);
    };

    const handleStart = () => {
        if (!parseResult.ok) return;
        onStart(parseResult.config, remember);
    };

    const copyOrigin = async () => {
        try {
            await navigator.clipboard.writeText(currentOrigin);
            setOriginCopied(true);
            setTimeout(() => setOriginCopied(false), 2000);
        } catch {
            // Clipboard unavailable — user copies manually
        }
    };

    return (
        <div style={layoutStyles.setupRoot}>
            <header style={layoutStyles.header}>
                <h1 style={layoutStyles.title}>OC Chat SDK — Streaming Demo</h1>
                <div style={layoutStyles.headerControls}>
                    {savedConfig && (
                        <button onClick={onClearStorage} style={btnStyles.tertiary} title="Remove saved customer from this browser">
                            Clear Saved Customer
                        </button>
                    )}
                </div>
            </header>

            <main style={layoutStyles.setupMain}>
                <h2 style={layoutStyles.stepHeading}>Step 1 · Paste your widget snippet</h2>
                <p style={layoutStyles.stepDescription}>
                    Copy the chat widget code from your Microsoft Contact Center admin app and paste it below.
                    We&apos;ll extract the widget ID, org ID, and org URL automatically.
                </p>

                {savedConfig && (
                    <div style={layoutStyles.savedConfigBanner}>
                        <span>Saved customer: <code>{savedConfig.orgUrl}</code></span>
                        <button onClick={useSavedConfig} style={btnStyles.tertiary}>Use saved</button>
                    </div>
                )}

                <textarea
                    value={snippet}
                    onChange={(e) => setSnippet(e.target.value)}
                    placeholder='<script id="Microsoft_Omnichannel_LCWidget" src="..." data-app-id="..." data-org-id="..." data-org-url="..." async></script>'
                    style={layoutStyles.snippetTextarea}
                    spellCheck={false}
                />

                <h2 style={layoutStyles.stepHeading}>Step 2 · Verify extracted values</h2>
                {snippet.trim() === '' ? (
                    <p style={layoutStyles.placeholderText}>Paste a snippet above to see the extracted values.</p>
                ) : parseResult.ok ? (
                    <ExtractionPreview config={parseResult.config} />
                ) : (
                    <div style={layoutStyles.parseError}>
                        <strong>Could not parse snippet:</strong>
                        <div>{parseResult.error}</div>
                    </div>
                )}

                <h2 style={layoutStyles.stepHeading}>Step 3 · Allow this origin in your widget config</h2>
                <p style={layoutStyles.stepDescription}>
                    You can do this step in parallel while figuring out the snippet — the origin is the same regardless of which customer you&apos;re demoing to.
                </p>
                <div style={layoutStyles.corsGuidance}>
                    <p>
                        The Microsoft Contact Center will block this app from connecting to your tenant
                        unless our origin is allowlisted in your widget&apos;s configuration.
                    </p>
                    <div style={layoutStyles.originRow}>
                        <code style={layoutStyles.originBadge}>{currentOrigin}</code>
                        <button onClick={copyOrigin} style={btnStyles.tertiary}>
                            {originCopied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <details style={layoutStyles.corsDetails}>
                        <summary>Where do I add this in the OC admin app?</summary>
                        <ol style={layoutStyles.corsSteps}>
                            <li>Open the Customer Service admin center.</li>
                            <li>Navigate to <strong>Workstreams</strong> → select the workstream backing this widget.</li>
                            <li>Open the <strong>Chat widget</strong> configuration.</li>
                            <li>Find <strong>Behaviors</strong> → <strong>Allow this widget on the following domains</strong>.</li>
                            <li>Add the origin shown above to the allowlist and save.</li>
                        </ol>
                        <p style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
                            For demos, we recommend doing this on a <em>test</em> widget config rather than
                            your production widget.
                        </p>
                    </details>
                </div>

                <div style={layoutStyles.startRow}>
                    <label style={layoutStyles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            disabled={!isValid}
                        />
                        Remember this customer in this browser
                    </label>
                    <button
                        onClick={handleStart}
                        style={isValid ? btnStyles.primary : btnStyles.primaryDisabled}
                        disabled={!isValid}
                        title={isValid ? 'Begin the chat session' : 'Paste a valid snippet first'}
                    >
                        Start Chat →
                    </button>
                </div>
            </main>
        </div>
    );
};

// ============================================================================
// ExtractionPreview — show the three extracted values with checkmarks
// ============================================================================

const ExtractionPreview: React.FC<{ config: WidgetConfig }> = ({ config }) => (
    <div style={layoutStyles.extractionTable}>
        <PreviewRow label="Widget ID" value={config.widgetId} />
        <PreviewRow label="Org ID" value={config.orgId} />
        <PreviewRow label="Org URL" value={config.orgUrl} />
    </div>
);

const PreviewRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div style={layoutStyles.previewRow}>
        <span style={layoutStyles.previewCheck}>✓</span>
        <span style={layoutStyles.previewLabel}>{label}</span>
        <code style={layoutStyles.previewValue}>{value}</code>
    </div>
);

// ============================================================================
// ChatScreen — the original two-pane layout (bubbles + event log)
// ============================================================================

const ChatScreen: React.FC<{
    config: WidgetConfig;
    onSwitchCustomer: () => void;
    onClearStorage: () => void;
}> = ({ config, onSwitchCustomer, onClearStorage }) => {
    const [chatSDK, setChatSDK] = useState<OmnichannelChatSDK | null>(null);
    const [chatActive, setChatActive] = useState(false);
    const [input, setInput] = useState('');
    const [bubbles, setBubbles] = useState<Map<string, BubbleState>>(new Map());
    const [events, setEvents] = useState<EventLogEntry[]>([]);
    const [error, setError] = useState<ChatError | null>(null);
    const [starting, setStarting] = useState(false);

    const eventCounter = useRef(0);
    const nextEventId = () => `evt-${++eventCounter.current}`;

    const logEvent = useCallback((entry: Omit<EventLogEntry, 'id' | 'timestamp'>) => {
        setEvents((prev) => [
            ...prev,
            { id: nextEventId(), timestamp: new Date(), ...entry },
        ]);
    }, []);

    const upsertBubble = useCallback((updater: (prev: Map<string, BubbleState>) => Map<string, BubbleState>) => {
        setBubbles((prev) => {
            const next = new Map(prev);
            return updater(next);
        });
    }, []);

    // ---------------------------------------------------------------------
    // SDK lifecycle
    // ---------------------------------------------------------------------

    const startChat = async () => {
        setError(null);
        setStarting(true);
        try {
            logEvent({ source: 'lifecycle', phase: 'initialize' });
            const sdk = new OmnichannelChatSDK(config);
            await sdk.initialize();

            logEvent({ source: 'lifecycle', phase: 'startChat' });
            await sdk.startChat();

            await sdk.onNewMessage((message: any) => {
                logEvent({
                    source: 'onNewMessage',
                    messageId: message.id,
                    contentPreview: (message.content ?? '').slice(0, 80),
                });
                upsertBubble((next) => {
                    const existing = next.get(message.id);
                    next.set(message.id, {
                        id: message.id,
                        sender: existing?.sender ?? 'bot',
                        senderDisplayName: existing?.senderDisplayName ?? message.sender?.displayName,
                        content: message.content ?? '',
                        isStreaming: false,
                        streamPhase: existing?.streamPhase,
                        streamEndReason: existing?.streamEndReason,
                        timestamp: new Date(message.timestamp ?? Date.now()),
                    });
                    return next;
                });
            });

            await sdk.onStreamingMessage((chunk: OmnichannelStreamingMessage) => {
                const phase = chunk.streamingMetadata.streamingMessageType;
                logEvent({
                    source: 'onStreamingMessage',
                    phase,
                    sequenceNumber: chunk.streamingMetadata.streamingSequenceNumber,
                    messageId: chunk.id,
                    contentPreview: (chunk.content ?? '').slice(0, 80),
                });
                upsertBubble((next) => {
                    next.set(chunk.id, {
                        id: chunk.id,
                        sender: 'bot',
                        senderDisplayName: chunk.sender?.displayName,
                        content: chunk.content ?? '',
                        isStreaming: phase !== 'final',
                        streamPhase: phase,
                        streamEndReason: chunk.streamingMetadata.streamEndReason,
                        timestamp: new Date(),
                    });
                    return next;
                });
            });

            setChatSDK(sdk);
            setChatActive(true);
            logEvent({ source: 'lifecycle', phase: 'ready' });
        } catch (e: unknown) {
            const errObj = classifyError(e);
            setError(errObj);
            logEvent({ source: 'lifecycle', phase: `error: ${errObj.message}` });
        } finally {
            setStarting(false);
        }
    };

    const sendMessage = async () => {
        if (!chatSDK || !input.trim()) return;
        const text = input.trim();
        setInput('');

        const localId = `user-${Date.now()}`;
        upsertBubble((next) => {
            next.set(localId, {
                id: localId,
                sender: 'user',
                content: text,
                isStreaming: false,
                timestamp: new Date(),
            });
            return next;
        });
        logEvent({ source: 'sendMessage', contentPreview: text.slice(0, 80) });

        try {
            await chatSDK.sendMessage({ content: text });
        } catch (e: unknown) {
            setError(classifyError(e));
        }
    };

    const endChat = async () => {
        if (!chatSDK) return;
        try {
            logEvent({ source: 'lifecycle', phase: 'endChat' });
            await chatSDK.endChat();
        } catch (e: unknown) {
            setError(classifyError(e));
        } finally {
            setChatSDK(null);
            setChatActive(false);
        }
    };

    // ---------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------

    const bubbleList = Array.from(bubbles.values()).sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    return (
        <div style={layoutStyles.chatRoot}>
            <header style={layoutStyles.header}>
                <div>
                    <h1 style={layoutStyles.title}>OC Chat SDK — Streaming Demo</h1>
                    <div style={layoutStyles.tenantSubtitle}>Connected to: <code>{config.orgUrl}</code></div>
                </div>
                <div style={layoutStyles.headerControls}>
                    <button onClick={onSwitchCustomer} style={btnStyles.tertiary}>Switch Customer</button>
                    <button onClick={onClearStorage} style={btnStyles.tertiary}>Clear Saved Customer</button>
                    {!chatActive ? (
                        <button onClick={startChat} disabled={starting} style={btnStyles.primary}>
                            {starting ? 'Starting…' : 'Start Chat'}
                        </button>
                    ) : (
                        <button onClick={endChat} style={btnStyles.secondary}>End Chat</button>
                    )}
                </div>
            </header>

            {error && <ErrorBanner error={error} onDismiss={() => setError(null)} />}

            <div style={layoutStyles.split}>
                <section style={layoutStyles.bubblePanel}>
                    <div style={layoutStyles.bubbleList}>
                        {bubbleList.length === 0 && (
                            <p style={layoutStyles.placeholderText}>
                                {chatActive
                                    ? 'No messages yet. Send a message below.'
                                    : 'Click "Start Chat" to begin.'}
                            </p>
                        )}
                        {bubbleList.map((b) => (
                            <ChatBubble key={b.id} bubble={b} />
                        ))}
                    </div>
                    {chatActive && (
                        <div style={layoutStyles.inputRow}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                                placeholder="Type a message and press Enter"
                                style={layoutStyles.input}
                            />
                            <button onClick={sendMessage} style={btnStyles.primary}>Send</button>
                        </div>
                    )}
                </section>

                <section style={layoutStyles.eventPanel}>
                    <div style={layoutStyles.eventHeader}>
                        <strong>Event Log ({events.length})</strong>
                        <button onClick={() => setEvents([])} style={btnStyles.tertiary}>Clear</button>
                    </div>
                    <div style={layoutStyles.eventList}>
                        {events.map((e) => (
                            <EventRow key={e.id} entry={e} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

// ============================================================================
// ErrorBanner — CORS-friendly when applicable
// ============================================================================

const ErrorBanner: React.FC<{ error: ChatError; onDismiss: () => void }> = ({ error, onDismiss }) => {
    if (error.kind === 'cors') {
        return (
            <div style={layoutStyles.corsErrorBanner}>
                <div style={{ flex: 1 }}>
                    <strong>Connection blocked (likely CORS).</strong>
                    <div style={{ marginTop: 4 }}>
                        Add this origin to your widget&apos;s allowed domains in the OC admin app, then click Start Chat again:
                    </div>
                    <code style={layoutStyles.originBadge}>{error.originToAdd}</code>
                </div>
                <button onClick={onDismiss} style={btnStyles.tertiary}>Dismiss</button>
            </div>
        );
    }
    return (
        <div style={layoutStyles.errorBanner}>
            <span style={{ flex: 1 }}>{error.message}</span>
            <button onClick={onDismiss} style={btnStyles.tertiary}>Dismiss</button>
        </div>
    );
};

// ============================================================================
// ChatBubble & EventRow — display components
// ============================================================================

const ChatBubble: React.FC<{ bubble: BubbleState }> = ({ bubble }) => {
    const isUser = bubble.sender === 'user';
    const align = isUser ? 'flex-end' : 'flex-start';
    const bg = isUser ? '#0078d4' : '#f3f3f3';
    const fg = isUser ? '#fff' : '#222';
    const phaseLabel = bubble.streamPhase
        ? ` · streaming:${bubble.streamPhase}${bubble.streamEndReason ? `(${bubble.streamEndReason})` : ''}`
        : '';

    return (
        <div style={{ display: 'flex', justifyContent: align, marginBottom: 8 }}>
            <div style={{
                maxWidth: '70%', background: bg, color: fg,
                padding: '8px 12px', borderRadius: 12,
                fontSize: 14, lineHeight: 1.4,
            }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                    {bubble.content || (bubble.isStreaming ? ' ' : '')}
                    {bubble.isStreaming && <span style={{ marginLeft: 6, opacity: 0.6 }}>▌</span>}
                </div>
                <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7 }}>
                    {bubble.senderDisplayName ?? bubble.sender}
                    {phaseLabel}
                </div>
            </div>
        </div>
    );
};

const EventRow: React.FC<{ entry: EventLogEntry }> = ({ entry }) => {
    const tagColor = ({
        onNewMessage: '#28a745',
        onStreamingMessage: '#0078d4',
        sendMessage: '#6c757d',
        lifecycle: '#6f42c1',
    } as const)[entry.source];

    return (
        <div style={{
            padding: '6px 8px', borderBottom: '1px solid #eee',
            fontSize: 12, fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        }}>
            <span style={{
                background: tagColor, color: '#fff',
                padding: '1px 6px', borderRadius: 3,
                marginRight: 6, fontSize: 11,
            }}>
                {entry.source}{entry.phase ? `:${entry.phase}` : ''}
                {entry.sequenceNumber !== undefined ? ` #${entry.sequenceNumber}` : ''}
            </span>
            {entry.contentPreview && <span>{entry.contentPreview}</span>}
            <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
                {entry.timestamp.toLocaleTimeString()}.{entry.timestamp.getMilliseconds().toString().padStart(3, '0')}
                {entry.messageId && ` · msg ${entry.messageId.slice(0, 12)}…`}
            </div>
        </div>
    );
};

// ============================================================================
// Helpers
// ============================================================================

function classifyError(e: unknown): ChatError {
    // ChatSDKError uses .message for the enum name (e.g., "MessagingClientInitializationFailure")
    // and stashes the underlying error in .exceptionDetails.errorObject. We inspect both because
    // CORS / network details only appear in the inner errorObject — the outer message is just the
    // SDK's classification. Without this, "Failed to fetch" CORS errors look generic.
    const err = e as {
        message?: string;
        exceptionDetails?: { response?: string; message?: string; errorObject?: string };
    };
    const outerMessage = String(err?.message ?? '');
    const innerObject = String(err?.exceptionDetails?.errorObject ?? '');
    const innerMessage = String(err?.exceptionDetails?.message ?? '');
    const innerResponse = String(err?.exceptionDetails?.response ?? '');

    const haystack = `${outerMessage} ${innerObject} ${innerMessage} ${innerResponse}`.toLowerCase();
    const looksLikeCors =
        haystack.includes('cors') ||
        haystack.includes('failed to fetch') ||
        haystack.includes('cross-origin') ||
        haystack.includes('access-control') ||
        haystack.includes('blocked by') ||
        (haystack.includes('network') && haystack.includes('error'));

    // Build a friendly display string: outer enum name + inner detail when available.
    const friendlyMessage = innerObject
        ? `${outerMessage}: ${innerObject}`
        : outerMessage || String(e ?? 'Unknown error');

    if (looksLikeCors) {
        return {
            kind: 'cors',
            message: friendlyMessage,
            originToAdd: typeof window !== 'undefined' ? window.location.origin : '',
        };
    }
    return { kind: 'other', message: friendlyMessage };
}

// ============================================================================
// Styles
// ============================================================================

const layoutStyles = {
    setupRoot: {
        display: 'flex',
        flexDirection: 'column' as const,
        minHeight: '100vh',
        background: '#fafafa',
    },
    chatRoot: {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100vh',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid #ddd',
        background: '#fff',
    },
    title: { fontSize: 18, margin: 0 },
    tenantSubtitle: { fontSize: 12, color: '#666', marginTop: 4 },
    headerControls: { display: 'flex', gap: 8 },
    setupMain: {
        flex: 1,
        padding: '24px 32px',
        maxWidth: 800,
        width: '100%',
        margin: '0 auto',
    },
    stepHeading: {
        fontSize: 16,
        marginTop: 24,
        marginBottom: 4,
    },
    stepDescription: {
        fontSize: 13,
        color: '#555',
        marginTop: 0,
    },
    snippetTextarea: {
        width: '100%',
        minHeight: 140,
        padding: 12,
        fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
        fontSize: 12,
        border: '1px solid #ccc',
        borderRadius: 6,
        background: '#fff',
        resize: 'vertical' as const,
    },
    placeholderText: {
        color: '#888',
        fontSize: 13,
    },
    parseError: {
        padding: 12,
        background: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb',
        borderRadius: 6,
        fontSize: 13,
    },
    extractionTable: {
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: 6,
        padding: 12,
    },
    previewRow: {
        display: 'grid',
        gridTemplateColumns: '24px 100px 1fr',
        alignItems: 'center',
        padding: '6px 0',
        borderBottom: '1px solid #f0f0f0',
        gap: 8,
    },
    previewCheck: {
        color: '#28a745',
        fontWeight: 'bold' as const,
    },
    previewLabel: {
        fontSize: 13,
        color: '#666',
    },
    previewValue: {
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        fontSize: 12,
        wordBreak: 'break-all' as const,
    },
    savedConfigBanner: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '8px 12px',
        background: '#e7f3ff',
        border: '1px solid #b3d7ff',
        borderRadius: 6,
        marginBottom: 12,
        fontSize: 13,
    },
    corsGuidance: {
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: 6,
        padding: 12,
        fontSize: 13,
    },
    originRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    originBadge: {
        background: '#fff',
        padding: '4px 8px',
        borderRadius: 3,
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        fontSize: 12,
        border: '1px solid #ddd',
    },
    corsDetails: {
        marginTop: 12,
        fontSize: 13,
    },
    corsSteps: {
        margin: '8px 0 0 16px',
        padding: 0,
    },
    startRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
    },
    errorBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 24px',
        background: '#f8d7da',
        color: '#721c24',
        borderBottom: '1px solid #f5c6cb',
        fontSize: 13,
    },
    corsErrorBanner: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 24px',
        background: '#fff3cd',
        color: '#856404',
        borderBottom: '1px solid #ffeaa7',
        fontSize: 13,
    },
    split: {
        display: 'grid',
        gridTemplateRows: '60% 40%',
        flex: 1,
        overflow: 'hidden',
    },
    bubblePanel: {
        display: 'flex',
        flexDirection: 'column' as const,
        borderBottom: '2px solid #ddd',
    },
    bubbleList: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: 16,
    },
    inputRow: {
        display: 'flex',
        gap: 8,
        padding: 12,
        borderTop: '1px solid #ddd',
    },
    input: {
        flex: 1,
        padding: '8px 12px',
        borderRadius: 6,
        border: '1px solid #ccc',
        fontSize: 14,
    },
    eventPanel: {
        display: 'flex',
        flexDirection: 'column' as const,
        background: '#fafafa',
    },
    eventHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 12px',
        background: '#2d2d2d',
        color: '#eee',
        fontSize: 13,
    },
    eventList: {
        flex: 1,
        overflowY: 'auto' as const,
        background: '#fff',
        color: '#222',
    },
};

const btnStyles = {
    primary: {
        padding: '8px 16px',
        background: '#0078d4',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 14,
    },
    primaryDisabled: {
        padding: '8px 16px',
        background: '#cce4f7',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        cursor: 'not-allowed' as const,
        fontSize: 14,
    },
    secondary: {
        padding: '8px 16px',
        background: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 14,
    },
    tertiary: {
        padding: '6px 12px',
        background: '#f0f0f0',
        color: '#333',
        border: '1px solid #ccc',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 12,
    },
};

export default App;
