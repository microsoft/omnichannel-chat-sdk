import { ChatMessage } from "@azure/communication-chat";
import { ChatMessageReceivedEvent, ChatMessageEditedEvent } from '@azure/communication-signaling';
import IRawMessage from "@microsoft/omnichannel-ic3core/lib/model/IRawMessage";
import LiveChatVersion from '../core/LiveChatVersion';
import OmnichannelMessage, { IFileMetadata, IPerson, MessageType, PersonType } from "../core/messaging/OmnichannelMessage";

interface CreateOmnichannelMessageOptionalParams {
    liveChatVersion: LiveChatVersion;
    debug?: boolean;
}

const createOmnichannelMessage = (message: IRawMessage | ChatMessageReceivedEvent | ChatMessageEditedEvent | ChatMessage, optionalParams: CreateOmnichannelMessageOptionalParams): OmnichannelMessage => {
    let omnichannelMessage = {} as OmnichannelMessage;
    omnichannelMessage.liveChatVersion = optionalParams.liveChatVersion || LiveChatVersion.V1;

    optionalParams.debug && console.log(message);

    if (optionalParams.liveChatVersion === LiveChatVersion.V2) {
        const {id, content, metadata, sender, senderDisplayName, createdOn, editedOn} = message as any;  // eslint-disable-line  @typescript-eslint/no-explicit-any

        omnichannelMessage.id = id;
        omnichannelMessage.messageid = undefined;
        omnichannelMessage.clientmessageid = undefined;
        omnichannelMessage.deliveryMode = undefined; // Backward compatibility
        omnichannelMessage.properties = {}; // Backward compatibility

        omnichannelMessage.content = content || '';
        omnichannelMessage.properties.tags = metadata && metadata.tags? metadata.tags : [];
        omnichannelMessage.tags = metadata && metadata.tags? metadata.tags.replace(/\"/g, "").split(",").filter((tag: string) => tag.length > 0): [];   // eslint-disable-line no-useless-escape
        omnichannelMessage.timestamp = editedOn ?? createdOn;
        omnichannelMessage.messageType = MessageType.UserMessage; // Backward compatibility
        omnichannelMessage.sender = {
            id: sender.communicationUserId,
            displayName: senderDisplayName,
            type: PersonType.Bot
        } as IPerson;

        if (metadata && metadata.amsMetadata && metadata.amsReferences || metadata.amsreferences) {
            try {
                const data = JSON.parse(metadata.amsMetadata);

                // "amsreferences" takes precedence
                const references = JSON.parse(metadata.amsreferences || metadata.amsReferences);
                const {fileName, contentType} = data[0];

                // fileMetadata should be defined only when there's an attachment
                omnichannelMessage.fileMetadata = {} as IFileMetadata; // Backward compatibility
                omnichannelMessage.fileMetadata.fileSharingProtocolType = 0;
                omnichannelMessage.fileMetadata.id = references[0];
                omnichannelMessage.fileMetadata.name = fileName;
                omnichannelMessage.fileMetadata.size = 0;
                omnichannelMessage.fileMetadata.type = contentType;
                omnichannelMessage.fileMetadata.url = '';
            } catch {
                // Suppress errors to keep chat flowing
            }
        }
    } else {
        const {clientmessageid} = message as IRawMessage;
        omnichannelMessage.id = clientmessageid as string;
        omnichannelMessage = {...message} as OmnichannelMessage;
    }

    return omnichannelMessage as OmnichannelMessage;
}

export default createOmnichannelMessage;