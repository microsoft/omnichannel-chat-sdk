import { ChatMessageEditedEvent, ChatMessageReceivedEvent } from '@azure/communication-signaling';
import OmnichannelMessage, { IFileMetadata, IPerson, MessageType, PersonType } from "../core/messaging/OmnichannelMessage";

import { ChatMessage } from "@azure/communication-chat";
import IRawMessage from "@microsoft/omnichannel-ic3core/lib/model/IRawMessage";
import LiveChatVersion from '../core/LiveChatVersion';

interface CreateOmnichannelMessageOptionalParams {
    liveChatVersion: LiveChatVersion;
    debug?: boolean;
}

const createOmnichannelMessage = (message: IRawMessage | ChatMessageReceivedEvent | ChatMessageEditedEvent | ChatMessage, optionalParams: CreateOmnichannelMessageOptionalParams): OmnichannelMessage => {
    optionalParams.debug && console.log(message);
    // it seems there is a superposition sending messages between polling and websocket,
    // so there is no point to override an already processed messagge
    if ("processed" in message) {
        return message as OmnichannelMessage;
    }

    const omnichannelMessage = {} as OmnichannelMessage;
    const { id, metadata, sequenceId } = message as any;  // eslint-disable-line  @typescript-eslint/no-explicit-any

    setMessageIdentifier(omnichannelMessage, id, sequenceId);
    setInitialDefaultValues(omnichannelMessage, id);
    setTags(omnichannelMessage, metadata);
    setContent(message, omnichannelMessage);
    setMetadata(metadata, omnichannelMessage);

    omnichannelMessage.processed = true;
    return omnichannelMessage as OmnichannelMessage;
}
const setMessageIdentifier = (omnichannelMessage: OmnichannelMessage, id: string, sequenceId: string) => {
    omnichannelMessage.messageid = id;
    omnichannelMessage.clientmessageid = undefined;
    omnichannelMessage.sequenceId = sequenceId;
    return omnichannelMessage;
}

const setInitialDefaultValues = (omnichannelMessage: OmnichannelMessage, id: string) => {

    omnichannelMessage.liveChatVersion = LiveChatVersion.V2;
    omnichannelMessage.id = id;
    omnichannelMessage.clientmessageid = undefined;
    omnichannelMessage.deliveryMode = undefined; // Backward compatibility
    omnichannelMessage.properties = {}; // Backward compatibility
    omnichannelMessage.content = '';

    return omnichannelMessage;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setTags = (omnichannelMessage: OmnichannelMessage, metadata: any,) => {

    omnichannelMessage.properties = omnichannelMessage.properties || {};
    omnichannelMessage.properties.tags = metadata && metadata.tags ? metadata.tags : [];
    omnichannelMessage.tags = metadata && metadata.tags ? metadata.tags.replace(/\"/g, "").split(",").filter((tag: string) => tag.length > 0) : []; // eslint-disable-line no-useless-escape

    return omnichannelMessage;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setContent = (message: IRawMessage | ChatMessageReceivedEvent | ChatMessageEditedEvent | ChatMessage, omnichannelMessage: OmnichannelMessage) => {

    const { content, sender, senderDisplayName, createdOn, editedOn } = message as any;  // eslint-disable-line  @typescript-eslint/no-explicit-any

    omnichannelMessage.timestamp = editedOn ?? createdOn;
    omnichannelMessage.messageType = MessageType.UserMessage; // Backward compatibility
    omnichannelMessage.sender = {
        id: sender.communicationUserId,
        displayName: senderDisplayName,
        type: PersonType.Bot
    } as IPerson;

    if (content) {
        if (typeof (content) === 'string') {
            omnichannelMessage.content = content;
        } else if (typeof (content) === 'object' && typeof (content?.message) === 'string') { // ChatMessage coming from ChatThreadClient.listMessages() API
            omnichannelMessage.content = content.message;
        }
    } else {
        if ((message as ChatMessageReceivedEvent).message) { // ChatMessageReceivedEvent coming from WS
            omnichannelMessage.content = (message as ChatMessageReceivedEvent).message;
        }
    }

    return omnichannelMessage;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setMetadata = (metadata: any, omnichannelMessage: OmnichannelMessage) => {

    if (metadata && metadata.amsMetadata && metadata.amsReferences || metadata?.amsreferences) {
        try {
            const data = JSON.parse(metadata.amsMetadata);
            // "amsreferences" takes precedence
            const references = JSON.parse(metadata.amsreferences || metadata?.amsReferences);
            const { fileName, contentType } = data[0];

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

    if (metadata.deliveryMode) {
        omnichannelMessage.deliveryMode = metadata.deliveryMode; // Backward compatibility
    }
    return omnichannelMessage;
}

export default createOmnichannelMessage;