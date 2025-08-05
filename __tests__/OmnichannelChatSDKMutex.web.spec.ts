import OmnichannelChatSDK from '../src/OmnichannelChatSDK';

describe('OmnichannelChatSDK Mutex Tests', () => {
    let omnichannelChatSDK: OmnichannelChatSDK;
    let omnichannelConfig: any;
    let chatSDKConfig: any;

    beforeEach(() => {
        omnichannelConfig = {
            orgId: 'testOrgId',
            orgUrl: 'https://test.dynamics.com',
            widgetId: 'testWidgetId'
        };

        chatSDKConfig = {
            telemetry: {
                disable: true
            }
        };

        omnichannelChatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
        
        // Mock the initialization state
        (omnichannelChatSDK as any).isInitialized = true;
        
        // Mock the telemetry and scenario marker
        (omnichannelChatSDK as any).scenarioMarker = {
            startScenario: jest.fn(),
            completeScenario: jest.fn(),
            failScenario: jest.fn()
        };
        
        // Mock the chatToken to avoid initialization issues
        (omnichannelChatSDK as any).chatToken = { chatId: 'test-chat-id' };
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('Mutex Implementation - executeWithLock', () => {
        it('should execute operation immediately when no operation is in progress', async () => {
            const mockOperation = jest.fn().mockResolvedValue('result');
            
            const result = await (omnichannelChatSDK as any).executeWithLock(mockOperation);
            
            expect(result).toBe('result');
            expect(mockOperation).toHaveBeenCalledTimes(1);
            expect((omnichannelChatSDK as any).chatOperationInProgress).toBe(false);
            expect((omnichannelChatSDK as any).pendingOperations).toHaveLength(0);
        });

        it('should queue operation when another operation is in progress', async () => {
            const firstOperation = jest.fn().mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve('first'), 100))
            );
            const secondOperation = jest.fn().mockResolvedValue('second');
            
            // Start first operation
            const firstPromise = (omnichannelChatSDK as any).executeWithLock(firstOperation);
            
            // Verify operation is in progress
            expect((omnichannelChatSDK as any).chatOperationInProgress).toBe(true);
            
            // Start second operation (should be queued)
            const secondPromise = (omnichannelChatSDK as any).executeWithLock(secondOperation);
            
            // Verify second operation is queued and not executed yet
            expect((omnichannelChatSDK as any).pendingOperations).toHaveLength(1);
            expect(secondOperation).not.toHaveBeenCalled();
            
            // Wait for both operations to complete
            const [firstResult, secondResult] = await Promise.all([firstPromise, secondPromise]);
            
            expect(firstResult).toBe('first');
            expect(secondResult).toBe('second');
            expect(firstOperation).toHaveBeenCalledTimes(1);
            expect(secondOperation).toHaveBeenCalledTimes(1);
            expect((omnichannelChatSDK as any).chatOperationInProgress).toBe(false);
            expect((omnichannelChatSDK as any).pendingOperations).toHaveLength(0);
        });

        it('should handle operation failures correctly', async () => {
            const errorMessage = 'Operation failed';
            const failingOperation = jest.fn().mockRejectedValue(new Error(errorMessage));
            
            await expect((omnichannelChatSDK as any).executeWithLock(failingOperation))
                .rejects.toThrow(errorMessage);
            
            expect(failingOperation).toHaveBeenCalledTimes(1);
            expect((omnichannelChatSDK as any).chatOperationInProgress).toBe(false);
            expect((omnichannelChatSDK as any).pendingOperations).toHaveLength(0);
        });

        it('should process queued operations after failure', async () => {
            const failingOperation = jest.fn().mockRejectedValue(new Error('First failed'));
            const successfulOperation = jest.fn().mockResolvedValue('success');
            
            // Start failing operation
            const failingPromise = (omnichannelChatSDK as any).executeWithLock(failingOperation);
            
            // Queue successful operation
            const successPromise = (omnichannelChatSDK as any).executeWithLock(successfulOperation);
            
            // Wait for failing operation to complete
            await expect(failingPromise).rejects.toThrow('First failed');
            
            // Successful operation should still execute
            const result = await successPromise;
            expect(result).toBe('success');
            expect(successfulOperation).toHaveBeenCalledTimes(1);
            expect((omnichannelChatSDK as any).chatOperationInProgress).toBe(false);
        });

        it('should maintain operation order in queue', async () => {
            const executionOrder: number[] = [];
            
            const createOperation = (id: number, delay: number) =>
                jest.fn().mockImplementation(() =>
                    new Promise(resolve =>
                        setTimeout(() => {
                            executionOrder.push(id);
                            resolve(`result${id}`);
                        }, delay)
                    )
                );
            
            const op1 = createOperation(1, 50);
            const op2 = createOperation(2, 30);
            const op3 = createOperation(3, 10);
            
            // Start all operations
            const promises = [
                (omnichannelChatSDK as any).executeWithLock(op1),
                (omnichannelChatSDK as any).executeWithLock(op2),
                (omnichannelChatSDK as any).executeWithLock(op3)
            ];
            
            await Promise.all(promises);
            
            // Operations should execute in order they were queued, not by delay
            expect(executionOrder).toEqual([1, 2, 3]);
        });
    });

    describe('startChat and endChat serialization', () => {
        beforeEach(() => {
            // Mock internal methods to avoid full initialization
            (omnichannelChatSDK as any).internalStartChat = jest.fn().mockImplementation(() =>
                new Promise<void>(resolve => setTimeout(resolve, 100))
            );
            (omnichannelChatSDK as any).internalEndChat = jest.fn().mockImplementation(() =>
                new Promise<void>(resolve => setTimeout(resolve, 100))
            );
        });

        it('should serialize multiple startChat calls', async () => {
            const startTime = Date.now();
            
            // Start multiple startChat operations
            const promises = [
                omnichannelChatSDK.startChat(),
                omnichannelChatSDK.startChat(),
                omnichannelChatSDK.startChat()
            ];
            
            await Promise.all(promises);
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should take at least 250ms due to serialization (allowing some tolerance)
            expect(duration).toBeGreaterThan(250);
            expect((omnichannelChatSDK as any).internalStartChat).toHaveBeenCalledTimes(3);
        });

        it('should serialize mixed startChat and endChat calls', async () => {
            const executionOrder: string[] = [];
            
            (omnichannelChatSDK as any).internalStartChat = jest.fn().mockImplementation(() => {
                return new Promise<void>(resolve => {
                    setTimeout(() => {
                        executionOrder.push('startChat');
                        resolve();
                    }, 50);
                });
            });
            
            (omnichannelChatSDK as any).internalEndChat = jest.fn().mockImplementation(() => {
                return new Promise<void>(resolve => {
                    setTimeout(() => {
                        executionOrder.push('endChat');
                        resolve();
                    }, 50);
                });
            });
            
            // Start mixed operations
            const promises = [
                omnichannelChatSDK.startChat(),
                omnichannelChatSDK.endChat(),
                omnichannelChatSDK.startChat(),
                omnichannelChatSDK.endChat()
            ];
            
            await Promise.all(promises);
            
            // Operations should execute in the order they were called
            expect(executionOrder).toEqual(['startChat', 'endChat', 'startChat', 'endChat']);
        });

        it('should handle exceptions in operations without breaking the queue', async () => {
            (omnichannelChatSDK as any).internalStartChat = jest.fn()
                .mockRejectedValueOnce(new Error('First start failed'))
                .mockResolvedValueOnce(undefined);
            
            (omnichannelChatSDK as any).internalEndChat = jest.fn()
                .mockResolvedValue(undefined);
            
            // First startChat should fail
            await expect(omnichannelChatSDK.startChat()).rejects.toThrow('First start failed');
            
            // Subsequent operations should still work
            await expect(omnichannelChatSDK.startChat()).resolves.toBeUndefined();
            await expect(omnichannelChatSDK.endChat()).resolves.toBeUndefined();
            
            expect((omnichannelChatSDK as any).internalStartChat).toHaveBeenCalledTimes(2);
            expect((omnichannelChatSDK as any).internalEndChat).toHaveBeenCalledTimes(1);
        });
    });

    describe('Race condition prevention', () => {
        it('should prevent startChat from being corrupted by endChat cleanup', async () => {
            const mockConversation = { disconnect: jest.fn() };
            const mockChatToken = { chatId: 'test123' };
            
            // Set up initial state
            (omnichannelChatSDK as any).conversation = mockConversation;
            (omnichannelChatSDK as any).chatToken = mockChatToken;
            
            let startChatCompleted = false;
            let endChatCompleted = false;
            
            (omnichannelChatSDK as any).internalStartChat = jest.fn().mockImplementation(async () => {
                // Simulate startChat setting up resources
                (omnichannelChatSDK as any).conversation = { id: 'new-conversation' };
                (omnichannelChatSDK as any).chatToken = { chatId: 'new123' };
                await new Promise<void>(resolve => setTimeout(resolve, 50));
                startChatCompleted = true;
            });
            
            (omnichannelChatSDK as any).internalEndChat = jest.fn().mockImplementation(async () => {
                // Simulate endChat cleanup
                await new Promise<void>(resolve => setTimeout(resolve, 30));
                if ((omnichannelChatSDK as any).conversation) {
                    (omnichannelChatSDK as any).conversation.disconnect?.();
                    (omnichannelChatSDK as any).conversation = null;
                }
                (omnichannelChatSDK as any).chatToken = {};
                endChatCompleted = true;
            });
            
            // Start endChat, then immediately start startChat
            const endChatPromise = omnichannelChatSDK.endChat();
            const startChatPromise = omnichannelChatSDK.startChat();
            
            await Promise.all([endChatPromise, startChatPromise]);
            
            // Verify both operations completed
            expect(endChatCompleted).toBe(true);
            expect(startChatCompleted).toBe(true);
            
            // Verify startChat resources were not corrupted by endChat
            // Because of serialization, startChat should execute after endChat
            expect((omnichannelChatSDK as any).conversation).toEqual({ id: 'new-conversation' });
            expect((omnichannelChatSDK as any).chatToken).toEqual({ chatId: 'new123' });
        });

        it('should handle rapid successive calls without race conditions', async () => {
            let chatState = 'idle';
            
            (omnichannelChatSDK as any).internalStartChat = jest.fn().mockImplementation(async () => {
                expect(chatState).toBe('idle'); // Should only start from idle state
                chatState = 'starting';
                await new Promise<void>(resolve => setTimeout(resolve, 10));
                chatState = 'active';
            });
            
            (omnichannelChatSDK as any).internalEndChat = jest.fn().mockImplementation(async () => {
                expect(chatState).toBe('active'); // Should only end from active state
                chatState = 'ending';
                await new Promise<void>(resolve => setTimeout(resolve, 10));
                chatState = 'idle';
            });
            
            // Rapid successive calls
            await omnichannelChatSDK.startChat();
            await omnichannelChatSDK.endChat();
            await omnichannelChatSDK.startChat();
            await omnichannelChatSDK.endChat();
            
            expect(chatState).toBe('idle');
            expect((omnichannelChatSDK as any).internalStartChat).toHaveBeenCalledTimes(2);
            expect((omnichannelChatSDK as any).internalEndChat).toHaveBeenCalledTimes(2);
        });
    });
});
