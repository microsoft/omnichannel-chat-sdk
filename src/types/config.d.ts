import FramedClient from "@microsoft/omnichannel-amsclient/lib/FramedClient";
import AuthSettings from "../core/AuthSettings";
import { CallingSDKLogger } from "../utils/loggers";
import FramedlessClient from "@microsoft/omnichannel-amsclient/lib/FramedlessClient";

export type VoiceVideoCallingOptionalParams={
    logger? : CallingSDKLogger | null;
}

export type AmsClient = FramedClient | FramedlessClient | null;

export type LiveChatConfig = {
    DataMaskingInfo: DataMaskingInfo;
    LiveChatConfigAuthSettings: AuthSettings;
    LiveWSAndLiveChatEngJoin: LiveWSAndLiveChatEngJoin;
    LiveChatVersion: number;
    ChatWidgetLanguage: ChatWidgetLanguage;
}

export type ChatWidgetLanguage = {
    msdyn_localeid: string,
    msdyn_languagename: string;
}

export type DataMaskingRules = {
    [key: string]: string;
}

export type Setting = {
    msdyn_maskforcustomer: boolean;
    msdyn_maskforagent: boolean;
    "@odata.etag": string;
}

export type DataMaskingInfo = {
    dataMaskingRules: DataMaskingRules;
    setting: Setting;
}

export type LiveWSAndLiveChatEngJoin = {
    PreChatSurvey: string,
    msdyn_autodetectlanguage: string;
    msdyn_widgetcustomizationconfig: string | null;
    msdyn_offlinewidgetsubtitle: string | null;
    msdyn_prechatenabled: string;
    msdyn_widgetposition: string;
    componentstate: string;
    msdyn_language: string;
    msdyn_widgetsnippet: string;
    msdyn_widgetsubtitle: string;
    msdyn_postconversationsurveybotsurveymessagetext: string | null;
    msdyn_enablescreensharing: string;
    statuscode: string;
    msdyn_postchatenabled: string;
    msdyn_offlinewidgettitle: string | null;
    msdyn_enablecobrowse: string;
    overwritetime: string;
    msdyn_widgetthemecolor: string;
    msdyn_genericagentdisplayname: string | null;
    msdyn_agentdisplayname: string;
    componentidunique: string;
    msdyn_enablefileattachmentsforagents: string;
    msdyn_widgetvisualnotification: string;
    msdyn_redirectionurl: string | null;
    msdyn_postconversationsurveybotsurveymode: string | null;
    msdyn_screensharingprovider: string | null;
    msdyn_mailbox: string | null;
    msdyn_postconversationsurveybotsurvey: string;
    msdyn_callingoptions: string;
    msdyn_portalurl: string | null;
    msdyn_customanonymoustokenexpirationtime: string | null;
    importsequencenumber: string | null;
    modifiedon: string;
    msdyn_positioninqueue_enabled: string;
    msdyn_requestvisitorlocation: string;
    utcconversiontimezonecode: string | null;
    msdyn_widgettitle: string;
    msdyn_enablefileattachmentsforcustomers: string;
    msdyn_duringnonoperatinghours: string | null;
    msdyn_offlinewidgetthemecolor: string | null;
    msdyn_botmcssurveyurl: string | null;
    msdyn_enablechatreconnect: string;
    msdyn_postconversationsurveymode: string;
    msdyn_showagentname: string;
    msdyn_emailtemplate: string;
    msdyn_livechatconfigid: string;
    statecode: string;
    msdyn_averagewaittime_enabled: string;
    msdyn_timetoreconnectwithpreviousagent: string | null;
    msdyn_mcssurveyurl: string | null;
    msdyn_surveyprovider: string | null;
    msdyn_authenticatedsigninoptional: string;
    msdyn_widgetappid: string;
    _msdyn_postconversationsurvey_value: string;
    msdyn_cobrowseprovider: string | null;
    msdyn_proactivechatenabled: string;
    ismanaged: string;
    timezoneruleversionnumber: string | null;
    overriddencreatedon: string | null;
    msdyn_showwidgetduringofflinehours: string;
    msdyn_enablechattranscriptemail: string;
    msdyn_conversationmode: string;
    msdyn_avatarurl: string;
    msdyn_name: string;
    solutionid: string;
    msdyn_postconversationsurveyenable: string;
    OutOfOperatingHours: string;
    msdyn_postconversationsurveymessagetext: string;
    msdyn_enablechattranscriptdownload: string;
    ShowWidget: string;
    msdyn_widgetsoundnotification: string;
    createdon: string;
    msdyn_infolabel: string | null;
    versionnumber: string;
    id: string;
    msfp_sourcesurveyidentifier: string;
    postConversationSurveyOwnerId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    LiveChatEngAndLiveChatLocJoin: any[];
}