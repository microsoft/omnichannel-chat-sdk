/* eslint-disable @typescript-eslint/no-explicit-any */

import LiveChatVersion from '../../src/core/LiveChatVersion';
import { MessageType } from '../../src/core/messaging/OmnichannelMessage';
import PersonType from '@microsoft/omnichannel-ic3core/lib/model/PersonType';
import createOmnichannelMessage from '../../src/utils/createOmnichannelMessage';

describe('createOmnichannelMessage', () => {
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
});
