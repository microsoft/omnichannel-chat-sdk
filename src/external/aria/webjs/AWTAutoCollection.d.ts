import { AWTPropertyStorageOverride } from './DataModels';
import AWTSemanticContext from './AWTSemanticContext';
/**
 * Class that stores semantic properties.
 */
export default class AWTAutoCollection {
    private static _propertyStorage;
    private static _semanticContext;
    private static _disableCookies;
    private static _areCookiesAvailable;
    static firstLaunchTime: string;
    /**
     * Add a property storage override to override the usage of document.cookie to store
     * properties. The property storage object should implement both getProperty and setProperty, otherwise
     * it will be rejected.
     * @param {object} propertyStorage - Property storage object which is used for storing SDK properties.
     * @return {boolean} True if the property storage override was accepted, false otherwise.
     */
    static addPropertyStorageOverride(propertyStorage: AWTPropertyStorageOverride): boolean;
    /**
     * Auto collect semantic context properties.
     * @param {object} semantContext   - The semantic context to use to set auto collected information.
     * @param {boolean} disableCookies - Determines if setting cookies is disabled.
     * @param {object} userAgent       - UserAgent string to be used for auto collection of semantic properties.
     */
    static autoCollect(semanticContext: AWTSemanticContext, disableCookies: boolean, userAgent?: string): void;
    /**
     * Checks if the device id stored is the same as the new device id. If they are not,
     * store the new id and store a new first launch time.
     * @param {string} deviceId - The new device id.
     */
    static checkAndSaveDeviceId(deviceId: string): void;
    /**
     * Auto collect the device SDK Id.
     */
    private static _autoCollectDeviceId();
    private static _autoCollect();
    private static _autoCollectFromUserAgent(userAgent);
    private static _getBrowserName(userAgent);
    private static _setFirstLaunchTime(flt);
    private static _userAgentContainsString(searchString, userAgent);
    private static _getBrowserVersion(userAgent, browserName);
    private static _getIeVersion(userAgent);
    private static _getOtherVersion(browserString, userAgent);
    private static _getOsName(userAgent);
    private static _getOsVersion(userAgent, osName);
    private static _getGenericOsVersion(userAgent, osName);
    private static _getMacOsxVersion(userAgent);
    private static _getDelimiter(versionString);
    private static _saveData(name, value);
    private static _getData(name);
    private static _deleteCookie(name);
}
