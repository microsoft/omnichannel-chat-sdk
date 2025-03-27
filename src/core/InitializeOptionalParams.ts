import GetLiveChatConfigOptionalParams from "./GetLiveChatConfigOptionalParams"

/**
 * Interface representing optional parameters for initialization.
 *
 * @property getLiveChatConfigOptionalParams - Optional parameters for retrieving the live chat configuration.
 * @property useParallelLoad - deprecated. this is not longer evaluated but was not removed for backward compatibility.
 * @property useSequentialLoad - Indicates whether to load resources sequentially. If set to `true`, resources will be loaded one after another in sequence.
 */
interface InitializeOptionalParams {
    /**
     * Optional parameters for retrieving the live chat configuration.
     */
    getLiveChatConfigOptionalParams?: GetLiveChatConfigOptionalParams;

    /**
     * @deprecated
     * Indicates whether to load resources in parallel.
     * Not longer evaluated but was not removed for backward compatibility.
     */
    useParallelLoad?: boolean;

    /**
     * Indicates whether to load resources sequentially.
     * If set to `true`, resources will be loaded one after another in sequence.
     */
    useSequentialLoad?: boolean;

}

export default InitializeOptionalParams