/**
* AWTSemanticContext.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
import AWTEventProperties from './AWTEventProperties';
import { AWTPiiKind } from '../common/Enums';
import { AWTUserIdType } from './Enums';
/**
 *  Class to allow users to set semantic context properties.
 */
export default class AWTSemanticContext {
    private _allowDeviceFields;
    private _properties;
    /**
     * @constructor
     * @param {boolean} _allowDeviceFields - Allow setting of device semantic context.
     * @param {object} _properties         - The event properties where to add the semantic context.
     */
    constructor(_allowDeviceFields: boolean, _properties: AWTEventProperties);
    /**
     * Sets the field AppInfo.Id with the given value.
     * @param {string} appId  - The Id uniquely identifies the App from this this event originated.
     * In the multi-tenant Aria Platform, this is the Application Id of the
     * registered Application. Example, "735d47645f7c4de69964e2c01888d6b6".
     */
    setAppId(appId: string): void;
    /**
     * Sets the field AppInfo.Version with the given value.
     * @param {string} appVersion  - The version of the App, retrieved programmatically where possible. This
     * is app/platform dependent. Examples such as "7.0.0.100" for Skype,
     * or "12.0.30723.00 Update 3" for Microsoft Visual Studio Ultimate 2013
     */
    setAppVersion(appVersion: string): void;
    /**
     * Sets the field AppInfo.Language with the given value.
     * @param {string} appLanguage  - Language of the App in IETF language tag format, as described in RFC 4646.
     * Examples of acceptable values include "en", "pt-BR" and "zh-Hant-CN".
     */
    setAppLanguage(appLanguage: string): void;
    /**
     * Sets the field DeviceInfo.Id with the given value.
     * @param {string} deviceId  - The device Id uniquely identifies the physical device, using platform
     * available API's. This allows correlation against Aria Hardware Inventory.
     */
    setDeviceId(deviceId: string): void;
    /**
     * Sets the field DeviceInfo.OsName with the given value.
     * @param {string} deviceOsName  - The name of the OS. The SDK should ensure this is a limited normalized
     * set. Asimov is using very high level value e.g. Windows/Android/iOS.
     * Examples such as "iOS" or "Windows Phone".
     */
    setDeviceOsName(deviceOsName: string): void;
    /**
     * Sets the field DeviceInfo.OsVersion with the given value.
     * @param {string} deviceOsVersion  - The version of the OS, retrieved programmatically, which can be used
     * for aggregation or filtering for scenarios like real time monitoring
     * or metrics reporting. Flurry and GA provide aggregation at this level.
     * Examples such as "8.1.2" for iOS, or "8.1" for Windows Phone.
     */
    setDeviceOsVersion(deviceOsVersion: string): void;
    /**
     * Sets the field DeviceInfo.Id with the given value.
     * @param {string} deviceBrowserName  - he name of the OS. The SDK should ensure this is a limited normalized set.
     * Examples such as "Chrome" or "Edge".
     */
    setDeviceBrowserName(deviceBrowserName: string): void;
    /**
     * Sets the field DeviceInfo.Id with the given value.
     * @param {string} deviceBrowserVersion  - The version of the browser, retrieved programmatically, which can be used
     * for aggregation or filtering for scenarios like real time monitoring or metrics reporting.
     * Examples such as "57.0.2987.133" for Chrome, or "15.15063" for Edge.
     */
    setDeviceBrowserVersion(deviceBrowserVersion: string): void;
    /**
     * Set the device manufacturer context information of telemetry event.
     * Can only be set at the LogManager level. Setting it via the object obtained from ILogger
     * will be no-op.
     * @param {string} deviceMake The manufacturer of the device, retrieved
     *            programmatically where possible and is app/platform specific
     */
    setDeviceMake(deviceMake: string): void;
    /**
     * Set the device model context information of telemetry event.
     * Can only be set at the LogManager level. Setting it via the object obtained from ILogger
     * will be no-op.
     * @param {string} deviceModel The model of the device, retrieved programmatically
     *            where possible and is app/platform specific
     */
    setDeviceModel(deviceModel: string): void;
    /**
     * Sets the field UserInfo.Id with the given value.
     * @param {string} userId     - The id uniquely identifies the user in an application-specific
     * user namespace, such as a Skype ID in the Skype App. This may be empty for Apps
     * which do not require user sign-in.
     * @param {enum} pii        - Optional pii type for the user id.
     * @param {enum} userIdType - Optional id type for the user id.
     */
    setUserId(userId: string, pii?: AWTPiiKind, userIdType?: AWTUserIdType): void;
    /**
     * Sets the field UserInfo.AdvertisingId with the given value.
     * @param {string} userAdvertisingId  - The AdvertisingId is the user-specific device id obtainable through
     * platform API's. This may not be available if users choose to opt-out
     * of this id, or if the underlying platform does not support it.
     */
    setUserAdvertisingId(userAdvertisingId: string): void;
    /**
     * Sets the field UserInfo.TimeZone with the given value.
     * @param {string} userTimeZone  - The user's time zone relative to UTC, in ISO 8601 time zone format.
     * Examples of acceptable values include "+00", "+07:00", and "-1130".
     */
    setUserTimeZone(userTimeZone: string): void;
    /**
     * Sets the field UserInfo.Language with the given value.
     * @param {string} userLanguage  - The user's language in IETF language tag format, as described in RFC 4646.
     * Examples of acceptable values include "en", "pt-BR" and "zh-Hant-CN".
     */
    setUserLanguage(userLanguage: string): void;
    private _addContext(key, value);
    private _addContextWithPii(key, value, pii);
}
