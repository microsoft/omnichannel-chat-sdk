/* eslint-disable @typescript-eslint/no-explicit-any */

import { ChatMessage } from '@azure/communication-chat';
import { ChatMessageEditedEvent, ChatMessageReceivedEvent } from '@azure/communication-signaling';
import LiveChatVersion from '../../src/core/LiveChatVersion';
import { MessageType, ResourceType } from '../../src/core/messaging/OmnichannelMessage';
import PersonType from '@microsoft/omnichannel-ic3core/lib/model/PersonType';
import createOmnichannelMessage from '../../src/utils/createOmnichannelMessage';

describe('createOmnichannelMessage', () => {
    const newMessage: ChatMessageReceivedEvent = {
        id: "synthetic-message",
        threadId: "synthetic-thread",
        sender: { kind: "communicationUser", communicationUserId: "synthetic-sender" },
        recipient: { kind: "communicationUser", communicationUserId: "synthetic-customer" },
        senderDisplayName: "Agent",
        type: "Text",
        message: "Synthetic content",
        metadata: { tags: "public" },
        version: "1720000000000",
        createdOn: new Date(1720000000000)
    };

    describe.each(["Customer", "Agent", "Bot", "System"])("edit classification for %s", senderDisplayName => {
        it.each(["realtime", "poll/history"])("marks a first-seen %s edit without dropping its content", source => {
            const event: ChatMessageEditedEvent = {
                ...newMessage,
                senderDisplayName,
                message: "Synthetic correction",
                editedOn: new Date(1720000000001),
                version: "1720000000001"
            };
            const snapshot: ChatMessage = {
                id: event.id,
                type: "text",
                sequenceId: "1",
                version: event.version,
                sender: event.sender,
                senderDisplayName,
                metadata: event.metadata,
                createdOn: event.createdOn,
                editedOn: event.editedOn,
                content: { message: event.message }
            };

            const converted = createOmnichannelMessage(source === "realtime" ? event : snapshot, {
                liveChatVersion: LiveChatVersion.V2
            });

            expect(converted.resourceType).toBe(ResourceType.MessageUpdate);
            expect(converted.content).toBe(event.message);
            expect(converted.id).toBe(event.id);
            expect(converted.timestamp).toBe(event.editedOn);
        });
    });

    it("preserves the new-message contract without adding an edit marker", () => {
        const converted = createOmnichannelMessage(newMessage, { liveChatVersion: LiveChatVersion.V2 });

        expect(converted).not.toHaveProperty("resourceType");
        expect(converted.content).toBe(newMessage.message);
    });

    it.each([undefined, null, new Date(NaN), "2026-01-01T00:00:00Z"])(
        "does not mark an invalid edit timestamp %p",
        editedOn => {
            const event = { ...newMessage };
            Reflect.set(event, "editedOn", editedOn);

            expect(createOmnichannelMessage(event, { liveChatVersion: LiveChatVersion.V2 }))
                .not.toHaveProperty("resourceType");
        }
    );

    it('createOmnichannelMessage with LiveChatV2 messaging contracts should return OmnichannelMessage contracts', () => {
        const amsReferences = ['id'];
        const amsMetadata = [{fileName: 'fileName.ext', size: 0, contentType: 'type'}]
        const sampleMessage = {
            id: 'id',
            content: 'content',
            metadata: {
                tags: 'tags',
                amsMetadata: JSON.stringify(amsMetadata),
                amsReferences: JSON.stringify(amsReferences)
            },
            sender: {
                communicationUserId: 'id',
                kind: "communicationUser"
            },
            senderDisplayName: 'senderDisplayName',
            createdOn: 'createdOn'
        };

        const omnichannelMessage = createOmnichannelMessage(sampleMessage as any, {
            liveChatVersion: LiveChatVersion.V2
        });

        expect(omnichannelMessage.id).toBeDefined();
        expect(omnichannelMessage.messageid).toBe(undefined);
        expect(omnichannelMessage.clientmessageid).toBe(undefined);
        expect(omnichannelMessage.deliveryMode).toBe(undefined);
        expect(omnichannelMessage.content).toBe(sampleMessage.content);
        expect(omnichannelMessage.tags).toEqual(sampleMessage.metadata.tags.split(','));
        expect(omnichannelMessage.timestamp).toBe(sampleMessage.createdOn);
        expect(omnichannelMessage.messageType).toBe(MessageType.UserMessage);
        expect(omnichannelMessage.sender).toEqual({
            id: sampleMessage.sender.communicationUserId,
            displayName: sampleMessage.senderDisplayName,
            type: PersonType.Bot
        });
        expect(omnichannelMessage.fileMetadata).toEqual({
            fileSharingProtocolType: 0,
            id: amsReferences[0],
            name: amsMetadata[0].fileName,
            size: 0,
            type: amsMetadata[0].contentType,
            url: ''
        });
    });

    it('createOmnichannelMessage with LiveChatV2 message from API should return OmnichannelMessage contracts', () => {
        const amsReferences = ['id'];
        const amsMetadata = [{fileName: 'fileName.ext', size: 0, contentType: 'type'}]
        const sampleMessage = {
            id: 'id',
            content: {
                message: "content"
            },
            metadata: {
                tags: 'tags',
                amsMetadata: JSON.stringify(amsMetadata),
                amsReferences: JSON.stringify(amsReferences)
            },
            sender: {
                communicationUserId: 'id',
                kind: "communicationUser"
            },
            senderDisplayName: 'senderDisplayName',
            createdOn: 'createdOn'
        };

        const omnichannelMessage = createOmnichannelMessage(sampleMessage as any, {
            liveChatVersion: LiveChatVersion.V2
        });

        expect(omnichannelMessage.id).toBeDefined();
        expect(omnichannelMessage.messageid).toBe(undefined);
        expect(omnichannelMessage.clientmessageid).toBe(undefined);
        expect(omnichannelMessage.deliveryMode).toBe(undefined);
        expect(omnichannelMessage.content).toBe(sampleMessage.content.message);
        expect(omnichannelMessage.tags).toEqual(sampleMessage.metadata.tags.split(','));
        expect(omnichannelMessage.timestamp).toBe(sampleMessage.createdOn);
        expect(omnichannelMessage.messageType).toBe(MessageType.UserMessage);
        expect(omnichannelMessage.sender).toEqual({
            id: sampleMessage.sender.communicationUserId,
            displayName: sampleMessage.senderDisplayName,
            type: PersonType.Bot
        });
        expect(omnichannelMessage.fileMetadata).toEqual({
            fileSharingProtocolType: 0,
            id: amsReferences[0],
            name: amsMetadata[0].fileName,
            size: 0,
            type: amsMetadata[0].contentType,
            url: ''
        });
    });

    it('createOmnichannelMessage with LiveChatV2 message from WS should return OmnichannelMessage contracts', () => {
        const amsReferences = ['id'];
        const amsMetadata = [{fileName: 'fileName.ext', size: 0, contentType: 'type'}]
        const sampleMessage = {
            id: 'id',
            message: "message",
            metadata: {
                tags: 'tags',
                amsMetadata: JSON.stringify(amsMetadata),
                amsReferences: JSON.stringify(amsReferences)
            },
            sender: {
                communicationUserId: 'id',
                kind: "communicationUser"
            },
            senderDisplayName: 'senderDisplayName',
            createdOn: 'createdOn'
        };

        const omnichannelMessage = createOmnichannelMessage(sampleMessage as any, {
            liveChatVersion: LiveChatVersion.V2
        });

        expect(omnichannelMessage.id).toBeDefined();
        expect(omnichannelMessage.messageid).toBe(undefined);
        expect(omnichannelMessage.clientmessageid).toBe(undefined);
        expect(omnichannelMessage.deliveryMode).toBe(undefined);
        expect(omnichannelMessage.content).toBe(sampleMessage.message);
        expect(omnichannelMessage.tags).toEqual(sampleMessage.metadata.tags.split(','));
        expect(omnichannelMessage.timestamp).toBe(sampleMessage.createdOn);
        expect(omnichannelMessage.messageType).toBe(MessageType.UserMessage);
        expect(omnichannelMessage.sender).toEqual({
            id: sampleMessage.sender.communicationUserId,
            displayName: sampleMessage.senderDisplayName,
            type: PersonType.Bot
        });
        expect(omnichannelMessage.fileMetadata).toEqual({
            fileSharingProtocolType: 0,
            id: amsReferences[0],
            name: amsMetadata[0].fileName,
            size: 0,
            type: amsMetadata[0].contentType,
            url: ''
        });
    });

    it('createOmnichannelMessage with LiveChatV2 message without attachment should not have fileMetadata defined', () => {
        const sampleMessage = {
            id: 'id',
            content: 'content',
            metadata: {
                tags: 'tags',
            },
            sender: {
                communicationUserId: 'id',
                kind: "communicationUser"
            },
            senderDisplayName: 'senderDisplayName',
            createdOn: 'createdOn'
        };

        const omnichannelMessage = createOmnichannelMessage(sampleMessage as any, {
            liveChatVersion: LiveChatVersion.V2
        });

        expect(omnichannelMessage.id).toBeDefined();
        expect(omnichannelMessage.messageid).toBe(undefined);
        expect(omnichannelMessage.clientmessageid).toBe(undefined);
        expect(omnichannelMessage.deliveryMode).toBe(undefined);
        expect(omnichannelMessage.content).toBe(sampleMessage.content);
        expect(omnichannelMessage.tags).toEqual(sampleMessage.metadata.tags.split(','));
        expect(omnichannelMessage.timestamp).toBe(sampleMessage.createdOn);
        expect(omnichannelMessage.messageType).toBe(MessageType.UserMessage);
        expect(omnichannelMessage.sender).toEqual({
            id: sampleMessage.sender.communicationUserId,
            displayName: sampleMessage.senderDisplayName,
            type: PersonType.Bot
        });
        expect(omnichannelMessage.fileMetadata).not.toBeDefined();
    });

    it('createOmnichannelMessage with LiveChatV2 message containing \'amsreferences\' should return the correct fileMetadata', () => {
        const amsReferences = ['id'];
        const amsMetadata = [{fileName: 'fileName.ext', size: 0, contentType: 'type'}]
        const sampleMessage = {
            id: 'id',
            content: '',
            metadata: {
                tags: 'tags',
                amsMetadata: JSON.stringify(amsMetadata),
                amsreferences: JSON.stringify(amsReferences)
            },
            sender: {
                communicationUserId: 'id',
                kind: "communicationUser"
            },
            senderDisplayName: 'senderDisplayName',
            createdOn: 'createdOn'
        };

        const omnichannelMessage = createOmnichannelMessage(sampleMessage as any, {
            liveChatVersion: LiveChatVersion.V2
        });

        expect(omnichannelMessage.fileMetadata).toEqual({
            fileSharingProtocolType: 0,
            id: amsReferences[0],
            name: amsMetadata[0].fileName,
            size: 0,
            type: amsMetadata[0].contentType,
            url: ''
        });
    });

    it('createOmnichannelMessage with LiveChatV2 message should take precedence of \'amsreferences\'', () => {
        const amsReferences = ['amsReferences'];
        const amsreferences = ['amsreferences'];
        const amsMetadata = [{fileName: 'fileName.ext', size: 0, contentType: 'type'}]
        const sampleMessage = {
            id: 'id',
            content: '',
            metadata: {
                tags: 'tags',
                amsMetadata: JSON.stringify(amsMetadata),
                amsReferences: JSON.stringify(amsReferences),
                amsreferences: JSON.stringify(amsreferences)
            },
            sender: {
                communicationUserId: 'id',
                kind: "communicationUser"
            },
            senderDisplayName: 'senderDisplayName',
            createdOn: 'createdOn'
        };

        const omnichannelMessage = createOmnichannelMessage(sampleMessage as any, {
            liveChatVersion: LiveChatVersion.V2
        });

        expect(omnichannelMessage.fileMetadata).toEqual({
            fileSharingProtocolType: 0,
            id: amsreferences[0],
            name: amsMetadata[0].fileName,
            size: 0,
            type: amsMetadata[0].contentType,
            url: ''
        });
    });

    it('createOmnichannelMessage with LiveChatV2 message with type:"html" (REST rehydrate path) should propagate contentType', () => {
        const sampleMessage = {
            id: 'id',
            type: 'html',
            content: '<strong>hey</strong>',
            metadata: { tags: 'tags' },
            sender: {
                communicationUserId: 'id',
                kind: "communicationUser"
            },
            senderDisplayName: 'senderDisplayName',
            createdOn: 'createdOn'
        };

        const omnichannelMessage = createOmnichannelMessage(sampleMessage as any, {
            liveChatVersion: LiveChatVersion.V2
        });

        expect(omnichannelMessage.contentType).toBe('html');
        expect(omnichannelMessage.content).toBe(sampleMessage.content);
    });

    it('createOmnichannelMessage with LiveChatV2 message with type:"RichText/Html" (WS signaling event) should normalize to "html"', () => {
        // ChatMessageReceivedEvent / ChatMessageEditedEvent deliver `type` as
        // 'RichText/Html' over the WebSocket, whereas the REST rehydrate path
        // returns 'html'. Normalize so consumers see one contract.
        const sampleMessage = {
            id: 'id',
            type: 'RichText/Html',
            content: '<strong>hey</strong>',
            metadata: { tags: 'tags' },
            sender: {
                communicationUserId: 'id',
                kind: "communicationUser"
            },
            senderDisplayName: 'senderDisplayName',
            createdOn: 'createdOn'
        };

        const omnichannelMessage = createOmnichannelMessage(sampleMessage as any, {
            liveChatVersion: LiveChatVersion.V2
        });

        expect(omnichannelMessage.contentType).toBe('html');
    });

    it('createOmnichannelMessage with LiveChatV2 message with type:"text" should propagate contentType', () => {
        const sampleMessage = {
            id: 'id',
            type: 'text',
            content: 'plain text',
            metadata: { tags: 'tags' },
            sender: {
                communicationUserId: 'id',
                kind: "communicationUser"
            },
            senderDisplayName: 'senderDisplayName',
            createdOn: 'createdOn'
        };

        const omnichannelMessage = createOmnichannelMessage(sampleMessage as any, {
            liveChatVersion: LiveChatVersion.V2
        });

        expect(omnichannelMessage.contentType).toBe('text');
    });

    it('createOmnichannelMessage with LiveChatV2 message with type:"Text" (WS signaling event) should normalize to "text"', () => {
        const sampleMessage = {
            id: 'id',
            type: 'Text',
            content: 'plain',
            metadata: { tags: 'tags' },
            sender: {
                communicationUserId: 'id',
                kind: "communicationUser"
            },
            senderDisplayName: 'senderDisplayName',
            createdOn: 'createdOn'
        };

        const omnichannelMessage = createOmnichannelMessage(sampleMessage as any, {
            liveChatVersion: LiveChatVersion.V2
        });

        expect(omnichannelMessage.contentType).toBe('text');
    });

    it('createOmnichannelMessage with LiveChatV2 message without type should default contentType to empty string', () => {
        const sampleMessage = {
            id: 'id',
            content: 'content',
            metadata: { tags: 'tags' },
            sender: {
                communicationUserId: 'id',
                kind: "communicationUser"
            },
            senderDisplayName: 'senderDisplayName',
            createdOn: 'createdOn'
        };

        const omnichannelMessage = createOmnichannelMessage(sampleMessage as any, {
            liveChatVersion: LiveChatVersion.V2
        });

        expect(omnichannelMessage.contentType).toBe('');
    });

    it('createOmnichannelMessage with LiveChatV2 messaging contracts with \'OriginalMessageId\' should return OmnichannelMessage contracts', () => {
        const amsReferences = ['id'];
        const amsMetadata = [{fileName: 'fileName.ext', size: 0, contentType: 'type'}]
        const sampleMessage = {
            id: 'id',
            content: 'content',
            metadata: {
                tags: 'tags',
                amsMetadata: JSON.stringify(amsMetadata),
                amsReferences: JSON.stringify(amsReferences),
                OriginalMessageId: 'originalMessageId'
            },
            sender: {
                communicationUserId: 'id',
                kind: "communicationUser"
            },
            senderDisplayName: 'senderDisplayName',
            createdOn: 'createdOn'
        };

        const omnichannelMessage = createOmnichannelMessage(sampleMessage as any, {
            liveChatVersion: LiveChatVersion.V2
        });

        expect(omnichannelMessage.id).toBeDefined();
        expect(omnichannelMessage.messageid).toBe(undefined);
        expect(omnichannelMessage.clientmessageid).toBe(undefined);
        expect(omnichannelMessage.deliveryMode).toBe(undefined);
        expect(omnichannelMessage.content).toBe(sampleMessage.content);
        expect(omnichannelMessage.properties).toBeDefined();
        expect(omnichannelMessage.tags).toEqual(sampleMessage.metadata.tags.split(','));
        expect(omnichannelMessage.timestamp).toBe(sampleMessage.createdOn);
        expect(omnichannelMessage.messageType).toBe(MessageType.UserMessage);
        expect(omnichannelMessage.sender).toEqual({
            id: sampleMessage.sender.communicationUserId,
            displayName: sampleMessage.senderDisplayName,
            type: PersonType.Bot
        });
        expect(omnichannelMessage.fileMetadata).toEqual({
            fileSharingProtocolType: 0,
            id: amsReferences[0],
            name: amsMetadata[0].fileName,
            size: 0,
            type: amsMetadata[0].contentType,
            url: ''
        });

        if (omnichannelMessage.properties) {
            expect(omnichannelMessage.properties.originalMessageId).toEqual(sampleMessage.metadata.OriginalMessageId);
        }
    });

    it('createOmnichannelMessage with LiveChatV2 message should not throw when sender is undefined', () => {
        const sampleMessage = {
            id: 'id',
            content: 'content',
            metadata: {
                tags: 'tags',
            },
            senderDisplayName: 'senderDisplayName',
            createdOn: 'createdOn'
            // sender intentionally omitted (undefined)
        };

        let omnichannelMessage: any;
        expect(() => {
            omnichannelMessage = createOmnichannelMessage(sampleMessage as any, {
                liveChatVersion: LiveChatVersion.V2
            });
        }).not.toThrow();

        expect(omnichannelMessage.sender).toEqual({
            id: undefined,
            displayName: sampleMessage.senderDisplayName,
            type: PersonType.Bot
        });
        expect(omnichannelMessage.content).toBe(sampleMessage.content);
    });

    it('createOmnichannelMessage with LiveChatV2 message should not throw when sender is null', () => {
        const sampleMessage = {
            id: 'id',
            content: 'content',
            metadata: {
                tags: 'tags',
            },
            sender: null,
            senderDisplayName: 'senderDisplayName',
            createdOn: 'createdOn'
        };

        let omnichannelMessage: any;
        expect(() => {
            omnichannelMessage = createOmnichannelMessage(sampleMessage as any, {
                liveChatVersion: LiveChatVersion.V2
            });
        }).not.toThrow();

        expect(omnichannelMessage.sender).toEqual({
            id: undefined,
            displayName: sampleMessage.senderDisplayName,
            type: PersonType.Bot
        });
    });

    it('createOmnichannelMessage with LiveChatV2 message should emit a debug warning when sender is missing and debug is enabled', () => {
        const sampleMessage = {
            id: 'id',
            content: 'content',
            metadata: {
                tags: 'tags',
            },
            sender: null,
            senderDisplayName: 'senderDisplayName',
            createdOn: 'createdOn'
        };

        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        try {
            createOmnichannelMessage(sampleMessage as any, {
                liveChatVersion: LiveChatVersion.V2,
                debug: true
            });

            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('has no sender'));
        } finally {
            consoleWarnSpy.mockRestore();
        }
    });

    it('createOmnichannelMessage with LiveChatV2 message should not emit a debug warning when sender is missing and debug is disabled', () => {
        const sampleMessage = {
            id: 'id',
            content: 'content',
            metadata: {
                tags: 'tags',
            },
            sender: null,
            senderDisplayName: 'senderDisplayName',
            createdOn: 'createdOn'
        };

        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        try {
            createOmnichannelMessage(sampleMessage as any, {
                liveChatVersion: LiveChatVersion.V2
            });

            expect(consoleWarnSpy).not.toHaveBeenCalled();
        } finally {
            consoleWarnSpy.mockRestore();
        }
    });
});
