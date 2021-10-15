import { ic3ClientVersion, webChatACSAdapterVersion, webChatIC3AdapterVersion } from "../config/settings";

const getIC3ClientCDNUrl = (version = ic3ClientVersion): string => {
    const IC3ClientCDNUrl = `https://comms.omnichannelengagementhub.com/release/${version}/Scripts/SDK/SDK.min.js`;
    return IC3ClientCDNUrl;
}

const getIC3AdapterCDNUrl = (version = webChatIC3AdapterVersion): string => {
    const IC3AdapterCDNUrl = `https://webchatic3.blob.core.windows.net/webchat-ic3adapter/${version}/botframework-webchat-adapter-ic3.production.min.js`;
    return IC3AdapterCDNUrl;
}

const getACSAdapterCDNUrl = (version = webChatACSAdapterVersion): string => {
    const ACSAdapterCDNUrl = `https://unpkg.com/acs_webchat-chat-adapter@${version}/dist/chat-adapter.js`;
    return ACSAdapterCDNUrl;
}

const getMsfpEmbedScript = (): string => {
    const msfpEmbedScript = '<script src="https://oc-cdn-ocprod.azureedge.net/livechatwidget/WebChatControl/lib/Embed.min.js" type="text/javascript"></script>' +
                            '<link rel="stylesheet" type="text/css" href="https://mfpembedcdnwus2.azureedge.net/mfpembedcontwus2/Embed.css" />' +
                            '<script type = "text/javascript" >function renderSurvey(parentElementId,surveyurl,FirstName, LastName, locale){var se = new SurveyEmbed(surveyurl,"https://mfpembedcdnmsit.azureedge.net/mfpembedcontmsit/","true");' +
                            'var context = {"First Name": FirstName,"Last Name": LastName,"locale": locale,"showmultilingual":"false"};se.renderInline(parentElementId, context);}</script>';
    return msfpEmbedScript;
}

export default {
    getIC3ClientCDNUrl,
    getIC3AdapterCDNUrl,
    getACSAdapterCDNUrl,
    getMsfpEmbedScript
}

export {
    getIC3ClientCDNUrl,
    getIC3AdapterCDNUrl,
    getACSAdapterCDNUrl,
    getMsfpEmbedScript
}