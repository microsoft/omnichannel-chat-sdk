import AttachmentContent from "../Attachment/AttachmentContent";
import AttachmentIcon from "../Attachment/AttachmentIcon";
import { DIRECT_LINE_INCOMING_ACTIVITY } from "./ActionTypes";

const imageRegex = /(\.)(jpeg|jpg|jiff|png|gif|bmp)$/i;
const audioMediaRegex = /(\.)(aac|aiff|alac|flac|mp2|mp3|pcm|wav|wma)$/i;
const videoMediaRegex = /(\.)(avchd|avi|flv|mpe|mpeg|mpg|mpv|mp4|m4p|m4v|mov|qt|swf|webm|wmv)$/i;

enum MimeTypes {
    UnknownFileType = "application/octet-stream"
}

/**
 * Patch card with different attachment data.
 * @param card
 * @param newAttachment
 */
function patchAttachment(card: any, newAttachment: any) {
    const { activity, attachment } = card;

    const patchedAttachment = Object.assign({}, attachment);
    patchedAttachment.contentType = newAttachment.contentType;
    patchedAttachment.thumbnailUrl = newAttachment.thumbnailUrl;

    const patchedAttachments = activity.attachments.map((target: any) =>
        target === attachment ? patchedAttachment : target
    );

    const patchedActivity = Object.assign({}, activity);
    patchedActivity.attachments = patchedAttachments;

    return {
        activity: patchedActivity,
        attachment: patchedAttachment
    };
}

const createAttachmentMiddleware = () => {
    console.log('[createAttachmentMiddleware]');

    const attachmentMiddleware = () => (next: any) => (card: any) => {
        console.log(`%c [AttachmentMiddleware]`, 'background: #ff69b4; color: #fff');
        console.log(card);

        const { activity: { attachments }, attachment } = card;

        // No attachment
        if (!attachments || !attachments.length || !attachment) {
            return next(card);
        }

        if (card.activity.channelData && card.activity.channelData.middlewareData) {
            attachment.contentUrl = card.activity.channelData.middlewareData[attachment.name];
        } else if (attachment.tempContentUrl) {
            attachment.contentUrl = attachment.tempContentUrl;
        }

        const fileExtension = attachment.name.substring(attachment.name.lastIndexOf('.') + 1, attachment.name.length) || attachment.name;
        const imageExtension = imageRegex.test(attachment.name);
        const audioExtension = audioMediaRegex.test(attachment.name);
        const videoExtension = videoMediaRegex.test(attachment.name);

        // Renders custom component on images
        if (imageExtension) {
            const patchedCard = patchAttachment(card, { contentType: MimeTypes.UnknownFileType, thumbnailUrl: undefined });
            return (
                <div>
                    {card && next(card)}
                    <AttachmentContent>
                        <AttachmentIcon name={attachment.name}/>
                        {patchedCard && next(patchedCard)}
                    </AttachmentContent>
                </div>
            )
        }

        // Renders custom component on audio/video files
        if (audioExtension || videoExtension) {
            if (card.activity.actionType && card.activity.actionType === DIRECT_LINE_INCOMING_ACTIVITY) {
                const patchedCard = patchAttachment(card, { contentType: MimeTypes.UnknownFileType, thumbnailUrl: undefined });
                return (
                    <div>
                        {card && next(card)}
                        <AttachmentContent>
                            <AttachmentIcon name={attachment.name}/>
                            {patchedCard && next(patchedCard)}
                        </AttachmentContent>
                    </div>
                )
            }
        }

        return (
            <AttachmentContent>
                <AttachmentIcon name={attachment.name}/>
                {next(card)}
            </AttachmentContent>
        )
    }

    return attachmentMiddleware;
}

export default createAttachmentMiddleware;