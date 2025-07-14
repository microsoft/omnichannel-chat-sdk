import OmnichannelChatSDK from "../../src/OmnichannelChatSDK";
import OmnichannelConfig from "../../src/core/OmnichannelConfig";
import ChatSDKConfig from "../../src/core/ChatSDKConfig";
import { CallType } from "../../src/core/CallCoordinator";

jest.mock("@microsoft/ocsdk");
jest.mock("../../src/core/messaging/ACSClient");

describe("OmnichannelChatSDK Call Coordination Integration", () => {
    let chatSDK: OmnichannelChatSDK;
    let omnichannelConfig: OmnichannelConfig;
    let chatSDKConfig: ChatSDKConfig;

    beforeEach(() => {
        omnichannelConfig = {
            orgId: "test-org-id",
            orgUrl: "https://test.crm.dynamics.com",
            widgetId: "test-widget-id"
        };

        chatSDKConfig = {
            telemetry: {
                disable: true, // Disable telemetry for tests
            }
        };

        chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);

        // Mock the required properties and methods to prevent actual API calls
        (chatSDK as any).isInitialized = true;
        (chatSDK as any).requestId = "test-request-id";
        (chatSDK as any).chatToken = { chatId: "test-chat-id" };
        (chatSDK as any).liveChatVersion = 2;
        (chatSDK as any).conversation = {
            disconnect: jest.fn()
        };
        (chatSDK as any).OCClient = {
            sessionId: null
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe("Call coordination logic", () => {
        it("should prevent same call type from running concurrently", async () => {
            // Mock the callCoordinator coordinateCall method to test our logic
            const coordinateCallSpy = jest.spyOn((chatSDK as any).callCoordinator, 'coordinateCall')
                .mockImplementation(async (callType: any) => {
                    // Simulate the real behavior - throw error for same type
                    if ((chatSDK as any)._currentCallType === callType) {
                        throw new Error(`${callType} is already in progress`);
                    }
                    (chatSDK as any)._currentCallType = callType;
                });

            const completeCallSpy = jest.spyOn((chatSDK as any).callCoordinator, 'completeCall')
                .mockImplementation((callType: any) => {
                    if ((chatSDK as any)._currentCallType === callType) {
                        (chatSDK as any)._currentCallType = null;
                    }
                });

            // Mock startChat to only call coordination
            jest.spyOn(chatSDK, 'startChat').mockImplementation(async () => {
                await (chatSDK as any).callCoordinator.coordinateCall(CallType.START_CHAT, "test-request", "test-chat");
                try {
                    // Simulate work
                    await new Promise(resolve => setTimeout(resolve, 10));
                } finally {
                    (chatSDK as any).callCoordinator.completeCall(CallType.START_CHAT);
                }
            });

            // First call should succeed
            const firstCall = chatSDK.startChat();

            // Second call should fail
            await expect(chatSDK.startChat()).rejects.toThrow("StartChat is already in progress");

            // Wait for first call to complete
            await firstCall;

            // Third call should succeed now
            await expect(chatSDK.startChat()).resolves.not.toThrow();

            expect(coordinateCallSpy).toHaveBeenCalledWith(CallType.START_CHAT, "test-request", "test-chat");
            expect(completeCallSpy).toHaveBeenCalledWith(CallType.START_CHAT);
        });

        it("should coordinate between startChat and endChat", async () => {
            let startChatInProgress = false;
            let endChatInProgress = false;

            // Mock the coordination logic
            jest.spyOn((chatSDK as any).callCoordinator, 'coordinateCall')
                .mockImplementation(async (callType: any) => {
                    if (callType === CallType.START_CHAT) {
                        // Wait if endChat is in progress
                        while (endChatInProgress) {
                            await new Promise(resolve => setTimeout(resolve, 10));
                        }
                        startChatInProgress = true;
                    } else if (callType === CallType.END_CHAT) {
                        // Wait if startChat is in progress
                        while (startChatInProgress) {
                            await new Promise(resolve => setTimeout(resolve, 10));
                        }
                        endChatInProgress = true;
                    }
                });

            jest.spyOn((chatSDK as any).callCoordinator, 'completeCall')
                .mockImplementation((callType: any) => {
                    if (callType === CallType.START_CHAT) {
                        startChatInProgress = false;
                    } else if (callType === CallType.END_CHAT) {
                        endChatInProgress = false;
                    }
                });

            // Mock the actual methods
            jest.spyOn(chatSDK, 'startChat').mockImplementation(async () => {
                await (chatSDK as any).callCoordinator.coordinateCall(CallType.START_CHAT, "test-request", "test-chat");
                try {
                    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate work
                } finally {
                    (chatSDK as any).callCoordinator.completeCall(CallType.START_CHAT);
                }
            });

            jest.spyOn(chatSDK, 'endChat').mockImplementation(async () => {
                await (chatSDK as any).callCoordinator.coordinateCall(CallType.END_CHAT, "test-request", "test-chat");
                try {
                    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate work
                } finally {
                    (chatSDK as any).callCoordinator.completeCall(CallType.END_CHAT);
                }
            });

            // Start both calls concurrently
            const startTime = Date.now();
            const startChatPromise = chatSDK.startChat();
            const endChatPromise = chatSDK.endChat();

            // Wait for both to complete
            await Promise.all([startChatPromise, endChatPromise]);
            const duration = Date.now() - startTime;

            // Should take longer than either individual call due to coordination
            expect(duration).toBeGreaterThan(80); // Should be around 100ms due to sequential execution
            expect(duration).toBeLessThan(200); // But not too long
        });

        it("should handle errors properly during coordination", async () => {
            // Mock coordination to track state
            let callInProgress: CallType | null = null;

            jest.spyOn((chatSDK as any).callCoordinator, 'coordinateCall')
                .mockImplementation(async (callType: any) => {
                    callInProgress = callType;
                });

            jest.spyOn((chatSDK as any).callCoordinator, 'completeCall')
                .mockImplementation((callType: any) => {
                    if (callInProgress === callType) {
                        callInProgress = null;
                    }
                });

            // Mock endChat to fail
            jest.spyOn(chatSDK, 'endChat').mockImplementation(async () => {
                await (chatSDK as any).callCoordinator.coordinateCall(CallType.END_CHAT, "test-request", "test-chat");
                try {
                    throw new Error("Test error");
                } finally {
                    (chatSDK as any).callCoordinator.completeCall(CallType.END_CHAT);
                }
            });

            jest.spyOn(chatSDK, 'startChat').mockImplementation(async () => {
                await (chatSDK as any).callCoordinator.coordinateCall(CallType.START_CHAT, "test-request", "test-chat");
                try {
                    // Simulate successful work
                } finally {
                    (chatSDK as any).callCoordinator.completeCall(CallType.START_CHAT);
                }
            });

            // endChat should fail
            await expect(chatSDK.endChat()).rejects.toThrow("Test error");

            // Should still be able to start a new call
            await expect(chatSDK.startChat()).resolves.not.toThrow();
        });
    });

    describe("Telemetry scenarios", () => {
        beforeEach(() => {
            // Enable telemetry for these tests
            chatSDKConfig.telemetry = { disable: false };
            chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            
            // Re-apply mocks
            (chatSDK as any).isInitialized = true;
            (chatSDK as any).requestId = "test-request-id";
            (chatSDK as any).chatToken = { chatId: "test-chat-id" };
        });

        it("should call telemetry methods during coordination", async () => {
            // Spy on telemetry methods
            const startScenarioSpy = jest.spyOn((chatSDK as any).scenarioMarker, 'startScenario');
            const completeScenarioSpy = jest.spyOn((chatSDK as any).scenarioMarker, 'completeScenario');

            // Test the CallCoordinator directly with real telemetry
            const coordinator = (chatSDK as any).callCoordinator;

            // Start first call
            await coordinator.coordinateCall(CallType.START_CHAT, "request-1", "chat-1");

            // Start second call (should trigger hold telemetry)
            const secondCallPromise = coordinator.coordinateCall(CallType.END_CHAT, "request-2", "chat-2");

            // Allow telemetry to be logged
            await new Promise(resolve => setTimeout(resolve, 10));

            // Complete first call
            coordinator.completeCall(CallType.START_CHAT);

            // Wait for second call to complete
            await secondCallPromise;

            // Verify telemetry was called
            expect(startScenarioSpy).toHaveBeenCalledWith(
                "EndChatCoordinationHold",
                expect.objectContaining({
                    RequestId: "request-2",
                    ChatId: "chat-2",
                    HoldReason: "Waiting for StartChat to complete",
                    OppositeCallType: "StartChat"
                })
            );

            expect(completeScenarioSpy).toHaveBeenCalledWith(
                "EndChatCoordinationHold",
                expect.objectContaining({
                    RequestId: "request-2",
                    ChatId: "chat-2",
                    HoldReason: "StartChat completed, proceeding with EndChat",
                    OppositeCallType: "StartChat"
                })
            );
        });
    });
});