import { ChatMessageReceivedEvent } from '@azure/communication-signaling';
import IRawMessage from "@microsoft/omnichannel-ic3core/lib/model/IRawMessage";
import LiveChatVersion from '../core/LiveChatVersion';
import OmnichannelMessage, { DeliveryMode, IFileMetadata, IPerson, MessageType, PersonType } from "../core/messaging/OmnichannelMessage";


interface CreateOmnichannelMessageOptionalParams {
    liveChatVersion: LiveChatVersion;
    debug?: boolean;
}

const createOmnichannelMessage = (message: IRawMessage | ChatMessageReceivedEvent, optionalParams: CreateOmnichannelMessageOptionalParams): OmnichannelMessage => {
    let omnichannelMessage = {} as OmnichannelMessage;
    omnichannelMessage.liveChatVersion = optionalParams.liveChatVersion || LiveChatVersion.V1;

    optionalParams.debug && console.log(message);

    if (optionalParams.liveChatVersion === LiveChatVersion.V2) {
        const {id, content, metadata, sender, senderDisplayName, createdOn} = message as any;

        omnichannelMessage.id = id;
        omnichannelMessage.messageid = undefined;
        omnichannelMessage.clientmessageid = undefined;
        omnichannelMessage.deliveryMode = DeliveryMode.Bridged; // Backward compatibility
        omnichannelMessage.properties = {}; // Backward compatibility

        omnichannelMessage.content = content || '';
        omnichannelMessage.properties.tags = metadata && metadata.tags? metadata.tags : [];
        omnichannelMessage.tags = metadata && metadata.tags? metadata.tags.replace(/\"/g, "").split(",").filter((tag: string) => tag.length > 0): [];
        omnichannelMessage.timestamp = createdOn;
        omnichannelMessage.messageType = MessageType.UserMessage; // Backward compatibility
        omnichannelMessage.sender = {
            id: sender.communicationUserId,
            displayName: senderDisplayName,
            type: PersonType.Bot
        } as IPerson;

        // TODO: Handle multiple attachments
        if (metadata && metadata.amsMetadata && metadata.amsReferences) {
            omnichannelMessage.fileMetadata = {} as IFileMetadata; // Backward compatibility
            omnichannelMessage.fileMetadata.fileSharingProtocolType = 0;

            const references = JSON.parse(metadata.amsReferences);
            omnichannelMessage.fileMetadata.id = references[0];

            const data = JSON.parse(metadata.amsMetadata);
            const {fileName} = data[0];

            omnichannelMessage.fileMetadata.name = fileName;
            omnichannelMessage.fileMetadata.size = 0;
            omnichannelMessage.fileMetadata.type = fileName.split('.').pop();
            omnichannelMessage.fileMetadata.url = '';
        }
    } else {
        const {clientmessageid} = message as IRawMessage;

        omnichannelMessage.id = clientmessageid as string;
        omnichannelMessage = {...message} as OmnichannelMessage;
    }

    return omnichannelMessage as OmnichannelMessage;
}

export default createOmnichannelMessage;