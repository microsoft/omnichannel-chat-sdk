interface InjectedLiveChatConfigAttestation {
    orgId: string;
    widgetId: string;
}

interface GetLiveChatConfigOptionalParams {
    sendCacheHeaders?: boolean;
    useRuntimeCache?: boolean;
    /**
     * A pre-fetched getLiveChatConfig payload the host may pass so the SDK can reuse it instead of making its own
     * network call. Used only when {@link injectedConfigAttestation} matches this SDK instance and the payload passes
     * validation; otherwise the SDK falls back to a network fetch. Ignored when sendCacheHeaders is set.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    injectedLiveChatConfig?: any;
    /**
     * Identity for {@link injectedLiveChatConfig}, which must match the orgId/widgetId this SDK was constructed with.
     */
    injectedConfigAttestation?: InjectedLiveChatConfigAttestation;
}

export type { InjectedLiveChatConfigAttestation };
export default GetLiveChatConfigOptionalParams;