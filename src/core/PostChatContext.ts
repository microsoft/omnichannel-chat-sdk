export default interface PostChatContext {
  formsProLocale: string;
  participantJoined: boolean;
  participantType: string | undefined;
  surveyInviteLink: string;
  botFormsProLocale: string;
  botSurveyInviteLink: string;
}