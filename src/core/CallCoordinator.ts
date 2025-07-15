import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";

/**
 * Enum representing the types of calls that can be coordinated
 */
enum CallType {
    START_CHAT = "StartChat",
    END_CHAT = "EndChat"
}

/**
 * Enum representing the current state of the chat session
 */
enum ChatState {
    IDLE = "Idle",
    CHAT_STARTED = "ChatStarted",
    CHAT_ENDED = "ChatEnded"
}

/**
 * Interface for tracking call execution state
 */
interface CallExecution {
    callType: CallType;
    requestId: string;
    chatId: string;
    promise: Promise<void>;
    resolveCallback: (() => void) | null;
}

/**
 * CallCoordinator handles coordination between startChat and endChat calls
 * to prevent race conditions when they are called in quick succession and
 * enforces state-based permissions to prevent multiple calls of the same type.
 */
class CallCoordinator {
    private currentExecution: CallExecution | null = null;
    private chatState: ChatState = ChatState.IDLE;
    private scenarioMarker: ScenarioMarker;

    constructor(scenarioMarker: ScenarioMarker) {
        this.scenarioMarker = scenarioMarker;
    }

    /**
     * Coordinates the execution of a call, ensuring that opposite calls wait
     * for completion before proceeding and enforcing state-based permissions.
     *
     * @param callType - The type of call being coordinated
     * @param requestId - The request ID for telemetry
     * @param chatId - The chat ID for telemetry
     * @returns Promise that resolves when the call can proceed
     */
    public async coordinateCall(callType: CallType, requestId: string, chatId: string): Promise<void> {
        // Check state-based permissions first
        this.checkStatePermissions(callType);

        // If no call is currently in progress, mark this call as in progress and proceed
        if (!this.currentExecution) {
            this.markCallInProgress(callType, requestId, chatId);
            return;
        }

        // If the same type of call is already in progress, throw an error
        if (this.currentExecution.callType === callType) {
            throw new Error(`${callType} is already in progress`);
        }

        // If the opposite call is in progress, wait for it to complete
        await this.waitForCallCompletion(callType, requestId, chatId);

        // State permissions will be automatically satisfied after waiting
        // (startChat completion enables endChat, endChat completion enables startChat)

        // Mark this call as in progress
        this.markCallInProgress(callType, requestId, chatId);
    }

    /**
     * Marks a call as completed and resolves any waiting calls.
     * Updates the chat state based on the completed call type.
     *
     * @param callType - The type of call that completed
     */
    public completeCall(callType: CallType): void {
        if (this.currentExecution && this.currentExecution.callType === callType) {
            if (this.currentExecution.resolveCallback) {
                this.currentExecution.resolveCallback();
            }
            this.currentExecution = null;
        }

        // Update chat state based on completed call
        this.updateChatState(callType);
    }

    /**
     * Marks a call as in progress
     */
    private markCallInProgress(callType: CallType, requestId: string, chatId: string): void {
        let resolveCallback: (() => void) | null = null;

        const promise = new Promise<void>((resolve) => {
            resolveCallback = resolve;
        });

        this.currentExecution = {
            callType,
            requestId,
            chatId,
            promise,
            resolveCallback
        };
    }

    /**
     * Waits for the current call to complete and logs telemetry
     */
    private async waitForCallCompletion(callType: CallType, requestId: string, chatId: string): Promise<void> {
        if (!this.currentExecution) {
            return;
        }

        const oppositeCallType = this.currentExecution.callType;
        const telemetryEventName = callType === CallType.START_CHAT
            ? TelemetryEvent.StartChatCoordinationHold
            : TelemetryEvent.EndChatCoordinationHold;

        // Start telemetry scenario for the hold
        this.scenarioMarker.startScenario(telemetryEventName, {
            RequestId: requestId,
            ChatId: chatId,
            HoldReason: `Waiting for ${oppositeCallType} to complete`,
            OppositeCallType: oppositeCallType
        });

        try {
            // Wait for the current execution to complete
            await this.currentExecution.promise;

            // Complete telemetry scenario for the hold
            this.scenarioMarker.completeScenario(telemetryEventName, {
                RequestId: requestId,
                ChatId: chatId,
                HoldReason: `${oppositeCallType} completed, proceeding with ${callType}`,
                OppositeCallType: oppositeCallType
            });
        } catch (error) {
            // Even if the opposite call failed, we still proceed with this call
            this.scenarioMarker.completeScenario(telemetryEventName, {
                RequestId: requestId,
                ChatId: chatId,
                HoldReason: `${oppositeCallType} completed (with error), proceeding with ${callType}`,
                OppositeCallType: oppositeCallType
            });
        }
    }

    /**
     * Checks if the requested call type is allowed based on current chat state
     *
     * @param callType - The type of call being requested
     */
    private checkStatePermissions(callType: CallType): void {
        if (callType === CallType.END_CHAT) {
            // endChat is only allowed when state is CHAT_STARTED OR when startChat is currently in progress
            if (this.chatState === ChatState.IDLE && (!this.currentExecution || this.currentExecution.callType !== CallType.START_CHAT)) {
                throw new Error("EndChat can only be called after startChat. Call startChat first to reset the permission.");
            } else if (this.chatState === ChatState.CHAT_ENDED) {
                throw new Error("EndChat can only be called after startChat. Call startChat first to reset the permission.");
            }
        }
        // Note: Removed state-based restrictions for startChat to allow legitimate re-initialization scenarios
        // The coordination logic still prevents concurrent calls and race conditions
    }

    /**
     * Updates the chat state based on the completed call type
     *
     * @param callType - The type of call that completed
     */
    private updateChatState(callType: CallType): void {
        if (callType === CallType.START_CHAT) {
            this.chatState = ChatState.CHAT_STARTED;
        } else if (callType === CallType.END_CHAT) {
            this.chatState = ChatState.CHAT_ENDED;
        }
    }
}

export { CallCoordinator, CallType, ChatState };