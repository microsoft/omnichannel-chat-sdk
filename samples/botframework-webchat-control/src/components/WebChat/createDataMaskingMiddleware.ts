import { IResultAction } from "../../interfaces/IResultAction";
import { IWebChatAction } from "../../interfaces/IWebChatAction";
import { IWebChatMiddleware } from "../../interfaces/IWebChatMiddleware";

export interface IDataMaskingRule {
    [key: string]: string;
}
export interface IDataMaskingSetting {
    msdyn_maskforcustomer: boolean;
    msdyn_maskforagent: boolean;
}
export interface IDataMaskingInfo {
    dataMaskingRules: IDataMaskingRule;
    setting: IDataMaskingSetting;
}

class DataMaskingMiddleware implements IWebChatMiddleware {
    private chatConfig: any;
    private dataMaskingRules: any;

    public constructor (chatConfig: any) {
        // console.log(`[DataMaskingMiddleware][constructor]`);
        this.chatConfig = chatConfig;
        this.dataMaskingRules = {};

        const { DataMaskingInfo: dataMaskingConfig } = chatConfig;

        const {setting} = dataMaskingConfig;
        this.dataMaskingRules = setting.msdyn_maskforcustomer? dataMaskingConfig.dataMaskingRules: {};

        console.log(`[DataMaskingRules]`);
        console.log(this.dataMaskingRules);
    }

    public applicable(action: any): boolean {
        // console.log(`[DataMaskingMiddleware][applicable]`);
        const { text } = action.payload;
        if (Object.keys(this.dataMaskingRules).length > 0 && text && action.type === "WEB_CHAT/SEND_MESSAGE") {
            return true;
        }
        return false;
    }

    public apply(action: any): IResultAction {
        // console.log('[DataMaskingMiddleware][apply]');
        let _nextAction = this.applyDataMasking(action);
        return {
            dispatchAction: null,
            nextAction: _nextAction
        };
    }

    private applyDataMasking(action: any): IWebChatAction {
        const maskingCharacter = '#';
        let {text} = action.payload;
        if (Object.keys(this.dataMaskingRules).length > 0) {
            for (const maskingRule of Object.values(this.dataMaskingRules)) {
                const regex = new RegExp(maskingRule as string, 'g');
                let match;
                while (match = regex.exec(text)) {
                    const replaceStr = match[0].replace(/./g, maskingCharacter);
                    text = text.replace(match[0], replaceStr);
                }
            }
        }

        action.payload.text = text;
        return action;
    }
}

const createDataMaskingMiddleware = (chatConfig: any) => {
    console.log('[createDataMaskingMiddleware]');
    return new DataMaskingMiddleware(chatConfig);
};

export {
    createDataMaskingMiddleware
}
