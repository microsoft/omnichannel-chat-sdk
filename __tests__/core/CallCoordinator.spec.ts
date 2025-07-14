import { CallCoordinator, CallType } from "../../src/core/CallCoordinator";
import ScenarioMarker from "../../src/telemetry/ScenarioMarker";
import TelemetryEvent from "../../src/telemetry/TelemetryEvent";
import OmnichannelConfig from "../../src/core/OmnichannelConfig";

describe("CallCoordinator", () => {
    let coordinator: CallCoordinator;
    let mockScenarioMarker: jest.Mocked<ScenarioMarker>;
    let mockOmnichannelConfig: OmnichannelConfig;

    beforeEach(() => {
        mockOmnichannelConfig = {
            orgId: "test-org-id",
            orgUrl: "https://test.crm.dynamics.com",
            widgetId: "test-widget-id"
        };

        mockScenarioMarker = {
            startScenario: jest.fn(),
            completeScenario: jest.fn(),
            failScenario: jest.fn(),
            singleRecord: jest.fn(),
            setDebug: jest.fn(),
            setScenarioType: jest.fn(),
            setRuntimeId: jest.fn(),
            useTelemetry: jest.fn()
        } as any;

        coordinator = new CallCoordinator(mockScenarioMarker);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("coordinateCall", () => {
        it("should allow first call to proceed immediately", async () => {
            // Arrange
            const requestId = "test-request-1";
            const chatId = "test-chat-1";

            // Act
            await coordinator.coordinateCall(CallType.START_CHAT, requestId, chatId);

            // Assert
            expect(mockScenarioMarker.startScenario).not.toHaveBeenCalled();
            expect(mockScenarioMarker.completeScenario).not.toHaveBeenCalled();
        });

        it("should throw error if same call type is already in progress", async () => {
            // Arrange
            const requestId = "test-request-1";
            const chatId = "test-chat-1";

            // First call starts
            await coordinator.coordinateCall(CallType.START_CHAT, requestId, chatId);

            // Act & Assert
            await expect(
                coordinator.coordinateCall(CallType.START_CHAT, requestId, chatId)
            ).rejects.toThrow("StartChat is already in progress");
        });

        it("should hold endChat when startChat is in progress", async () => {
            // Arrange
            const startRequestId = "start-request-1";
            const startChatId = "start-chat-1";
            const endRequestId = "end-request-1";
            const endChatId = "end-chat-1";

            // Start the first call but don't complete it
            await coordinator.coordinateCall(CallType.START_CHAT, startRequestId, startChatId);

            // Act - Start second call in background
            const endChatPromise = coordinator.coordinateCall(CallType.END_CHAT, endRequestId, endChatId);

            // Allow some time for the hold scenario to start
            await new Promise(resolve => setTimeout(resolve, 10));

            // Assert - Hold telemetry should have started
            expect(mockScenarioMarker.startScenario).toHaveBeenCalledWith(
                TelemetryEvent.EndChatCoordinationHold,
                {
                    RequestId: endRequestId,
                    ChatId: endChatId,
                    HoldReason: "Waiting for StartChat to complete",
                    OppositeCallType: CallType.START_CHAT
                }
            );

            // Complete the first call
            coordinator.completeCall(CallType.START_CHAT);

            // Wait for second call to proceed
            await endChatPromise;

            // Assert - Hold telemetry should have completed
            expect(mockScenarioMarker.completeScenario).toHaveBeenCalledWith(
                TelemetryEvent.EndChatCoordinationHold,
                {
                    RequestId: endRequestId,
                    ChatId: endChatId,
                    HoldReason: "StartChat completed, proceeding with EndChat",
                    OppositeCallType: CallType.START_CHAT
                }
            );
        });

        it("should hold startChat when endChat is in progress", async () => {
            // Arrange
            const endRequestId = "end-request-1";
            const endChatId = "end-chat-1";
            const startRequestId = "start-request-1";
            const startChatId = "start-chat-1";

            // Start the first call but don't complete it
            await coordinator.coordinateCall(CallType.END_CHAT, endRequestId, endChatId);

            // Act - Start second call in background
            const startChatPromise = coordinator.coordinateCall(CallType.START_CHAT, startRequestId, startChatId);

            // Allow some time for the hold scenario to start
            await new Promise(resolve => setTimeout(resolve, 10));

            // Assert - Hold telemetry should have started
            expect(mockScenarioMarker.startScenario).toHaveBeenCalledWith(
                TelemetryEvent.StartChatCoordinationHold,
                {
                    RequestId: startRequestId,
                    ChatId: startChatId,
                    HoldReason: "Waiting for EndChat to complete",
                    OppositeCallType: CallType.END_CHAT
                }
            );

            // Complete the first call
            coordinator.completeCall(CallType.END_CHAT);

            // Wait for second call to proceed
            await startChatPromise;

            // Assert - Hold telemetry should have completed
            expect(mockScenarioMarker.completeScenario).toHaveBeenCalledWith(
                TelemetryEvent.StartChatCoordinationHold,
                {
                    RequestId: startRequestId,
                    ChatId: startChatId,
                    HoldReason: "EndChat completed, proceeding with StartChat",
                    OppositeCallType: CallType.END_CHAT
                }
            );
        });

        it("should handle coordination even when first call fails", async () => {
            // Arrange
            const startRequestId = "start-request-1";
            const startChatId = "start-chat-1";
            const endRequestId = "end-request-1";
            const endChatId = "end-chat-1";

            // Start the first call
            await coordinator.coordinateCall(CallType.START_CHAT, startRequestId, startChatId);

            // Start second call in background
            const endChatPromise = coordinator.coordinateCall(CallType.END_CHAT, endRequestId, endChatId);

            // Allow some time for the hold scenario to start
            await new Promise(resolve => setTimeout(resolve, 10));

            // Complete the first call (simulate failure by completing)
            coordinator.completeCall(CallType.START_CHAT);

            // Wait for second call to proceed
            await endChatPromise;

            // Assert - Hold telemetry should have completed
            expect(mockScenarioMarker.completeScenario).toHaveBeenCalledWith(
                TelemetryEvent.EndChatCoordinationHold,
                expect.objectContaining({
                    RequestId: endRequestId,
                    ChatId: endChatId,
                    OppositeCallType: CallType.START_CHAT
                })
            );
        });
    });

    describe("completeCall", () => {
        it("should not fail when completing a call that hasn't started", () => {
            // Act & Assert - Should not throw
            expect(() => {
                coordinator.completeCall(CallType.START_CHAT);
            }).not.toThrow();
        });

        it("should only complete the matching call type", async () => {
            // Arrange
            const requestId = "test-request-1";
            const chatId = "test-chat-1";

            await coordinator.coordinateCall(CallType.START_CHAT, requestId, chatId);

            // Act - Try to complete wrong call type
            coordinator.completeCall(CallType.END_CHAT);

            // Try to start same call type again - should still throw
            await expect(
                coordinator.coordinateCall(CallType.START_CHAT, requestId, chatId)
            ).rejects.toThrow("StartChat is already in progress");

            // Complete correct call type
            coordinator.completeCall(CallType.START_CHAT);

            // Now should be able to start same call type
            await expect(
                coordinator.coordinateCall(CallType.START_CHAT, requestId, chatId)
            ).resolves.not.toThrow();
        });
    });

    describe("integration scenarios", () => {
        it("should handle multiple sequential calls correctly", async () => {
            // Test sequence: START -> END -> START -> END
            const requestId = "test-request";
            const chatId = "test-chat";

            // Call 1: START_CHAT
            await coordinator.coordinateCall(CallType.START_CHAT, requestId, chatId);
            coordinator.completeCall(CallType.START_CHAT);

            // Call 2: END_CHAT
            await coordinator.coordinateCall(CallType.END_CHAT, requestId, chatId);
            coordinator.completeCall(CallType.END_CHAT);

            // Call 3: START_CHAT again
            await coordinator.coordinateCall(CallType.START_CHAT, requestId, chatId);
            coordinator.completeCall(CallType.START_CHAT);

            // Call 4: END_CHAT again
            await coordinator.coordinateCall(CallType.END_CHAT, requestId, chatId);
            coordinator.completeCall(CallType.END_CHAT);

            // Should not have any hold scenarios since calls were sequential
            expect(mockScenarioMarker.startScenario).not.toHaveBeenCalled();
        });

        it("should handle overlapping calls with proper coordination", async () => {
            const startRequestId = "start-request";
            const startChatId = "start-chat";
            const endRequestId = "end-request";
            const endChatId = "end-chat";

            // Start first call
            await coordinator.coordinateCall(CallType.START_CHAT, startRequestId, startChatId);

            // Start second call (should be held)
            const endChatPromise = coordinator.coordinateCall(CallType.END_CHAT, endRequestId, endChatId);

            // Allow hold to start
            await new Promise(resolve => setTimeout(resolve, 10));

            // Verify hold started
            expect(mockScenarioMarker.startScenario).toHaveBeenCalledWith(
                TelemetryEvent.EndChatCoordinationHold,
                expect.any(Object)
            );

            // Complete first call
            coordinator.completeCall(CallType.START_CHAT);

            // Wait for second call to complete
            await endChatPromise;

            // Verify hold completed
            expect(mockScenarioMarker.completeScenario).toHaveBeenCalledWith(
                TelemetryEvent.EndChatCoordinationHold,
                expect.any(Object)
            );

            // Complete second call
            coordinator.completeCall(CallType.END_CHAT);

            // Reset mocks for next test
            jest.clearAllMocks();

            // Should now be able to start new calls without coordination
            await coordinator.coordinateCall(CallType.START_CHAT, startRequestId, startChatId);
            expect(mockScenarioMarker.startScenario).not.toHaveBeenCalled();
        });
    });
});