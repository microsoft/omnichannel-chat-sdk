import LiveChatVersion from '../../src/core/LiveChatVersion';
import createOmnichannelMessage from '../../src/utils/createOmnichannelMessage';
import { ChatMessageReceivedEvent } from '@azure/communication-signaling';
import { DeliveryMode, MessageType } from '../../src/core/messaging/OmnichannelMessage';
import PersonType from '@microsoft/omnichannel-ic3core/lib/model/PersonType';

describe('createOmnichannelMessage', () => {
    it ('createOmnichannelMessage with LiveChatV2 messaging contracts should return OmnichannelMessage contracts', () => {
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
            type: 'ext',
            url: ''
        });
    });
});
