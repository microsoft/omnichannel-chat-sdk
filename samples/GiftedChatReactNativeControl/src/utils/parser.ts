export const parseTranscript = (transcriptData: any) => {
  const jsonData = typeof(transcriptData) === 'string'? JSON.parse(transcriptData): transcriptData;
  const messages = typeof(jsonData['chatMessagesJson']) === 'string'? JSON.parse(jsonData['chatMessagesJson']): jsonData['chatMessagesJson'];

  let output = "";
  for (const message of messages.reverse()) {
    let {from, tags, content, attachments} = message;
    if (from === null) {
      continue;
    }

    let displayName = '';

    if (tags === 'system') {
      displayName = 'System';
    } else if (from.application) {
      displayName = from.application.displayName;
    } else if (from.guest) {
      displayName = from.guest.displayName;
    } else if (from.user) {
      displayName = from.user.displayName;
    }

    if (attachments && attachments.length > 0) {
      const fileName = attachments[0].name;
      content = `The following attachment was uploaded during the conversation: '${fileName}'`;
    }

    output += `${displayName}: ${content} \n`;
  }

  return output;
}
