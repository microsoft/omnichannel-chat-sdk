/**
* AWTLogManagerSettings.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
import AWTEventProperties from './AWTEventProperties';
import AWTSemanticContext from './AWTSemanticContext';
/**
* Class that stores LogManagers context.
*/
export default class AWTLogManagerSettings {
    static logManagerContext: AWTEventProperties;
    static sessionEnabled: boolean;
    static loggingEnabled: boolean;
    static defaultTenantToken: string;
    static semanticContext: AWTSemanticContext;
}
