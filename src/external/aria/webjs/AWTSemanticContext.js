"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AWTAutoCollection_1 = require("./AWTAutoCollection");
var Enums_1 = require("../common/Enums");
var Enums_2 = require("./Enums");
var UI_IDTYPE = 'UserInfo.IdType';
/**
 *  Class to allow users to set semantic context properties.
 */
var AWTSemanticContext = /** @class */ (function () {
    /**
     * @constructor
     * @param {boolean} _allowDeviceFields - Allow setting of device semantic context.
     * @param {object} _properties         - The event properties where to add the semantic context.
     */
    function AWTSemanticContext(_allowDeviceFields, _properties) {
        this._allowDeviceFields = _allowDeviceFields;
        this._properties = _properties;
    }
    /**
     * Sets the field AppInfo.Id with the given value.
     * @param {string} appId  - The Id uniquely identifies the App from this this event originated.
     * In the multi-tenant Aria Platform, this is the Application Id of the
     * registered Application. Example, "735d47645f7c4de69964e2c01888d6b6".
     */
    AWTSemanticContext.prototype.setAppId = function (appId) {
        this._addContext('AppInfo.Id', appId);
    };
    /**
     * Sets the field AppInfo.Version with the given value.
     * @param {string} appVersion  - The version of the App, retrieved programmatically where possible. This
     * is app/platform dependent. Examples such as "7.0.0.100" for Skype,
     * or "12.0.30723.00 Update 3" for Microsoft Visual Studio Ultimate 2013
     */
    AWTSemanticContext.prototype.setAppVersion = function (appVersion) {
        this._addContext('AppInfo.Version', appVersion);
    };
    /**
     * Sets the field AppInfo.Language with the given value.
     * @param {string} appLanguage  - Language of the App in IETF language tag format, as described in RFC 4646.
     * Examples of acceptable values include "en", "pt-BR" and "zh-Hant-CN".
     */
    AWTSemanticContext.prototype.setAppLanguage = function (appLanguage) {
        this._addContext('AppInfo.Language', appLanguage);
    };
    /**
     * Sets the field DeviceInfo.Id with the given value.
     * @param {string} deviceId  - The device Id uniquely identifies the physical device, using platform
     * available API's. This allows correlation against Aria Hardware Inventory.
     */
    AWTSemanticContext.prototype.setDeviceId = function (deviceId) {
        if (this._allowDeviceFields) {
            AWTAutoCollection_1.default.checkAndSaveDeviceId(deviceId);
            this._addContext('DeviceInfo.Id', deviceId);
        }
    };
    /**
     * Sets the field DeviceInfo.OsName with the given value.
     * @param {string} deviceOsName  - The name of the OS. The SDK should ensure this is a limited normalized
     * set. Asimov is using very high level value e.g. Windows/Android/iOS.
     * Examples such as "iOS" or "Windows Phone".
     */
    AWTSemanticContext.prototype.setDeviceOsName = function (deviceOsName) {
        if (this._allowDeviceFields) {
            this._addContext('DeviceInfo.OsName', deviceOsName);
        }
    };
    /**
     * Sets the field DeviceInfo.OsVersion with the given value.
     * @param {string} deviceOsVersion  - The version of the OS, retrieved programmatically, which can be used
     * for aggregation or filtering for scenarios like real time monitoring
     * or metrics reporting. Flurry and GA provide aggregation at this level.
     * Examples such as "8.1.2" for iOS, or "8.1" for Windows Phone.
     */
    AWTSemanticContext.prototype.setDeviceOsVersion = function (deviceOsVersion) {
        if (this._allowDeviceFields) {
            this._addContext('DeviceInfo.OsVersion', deviceOsVersion);
        }
    };
    /**
     * Sets the field DeviceInfo.Id with the given value.
     * @param {string} deviceBrowserName  - he name of the OS. The SDK should ensure this is a limited normalized set.
     * Examples such as "Chrome" or "Edge".
     */
    AWTSemanticContext.prototype.setDeviceBrowserName = function (deviceBrowserName) {
        if (this._allowDeviceFields) {
            this._addContext('DeviceInfo.BrowserName', deviceBrowserName);
        }
    };
    /**
     * Sets the field DeviceInfo.Id with the given value.
     * @param {string} deviceBrowserVersion  - The version of the browser, retrieved programmatically, which can be used
     * for aggregation or filtering for scenarios like real time monitoring or metrics reporting.
     * Examples such as "57.0.2987.133" for Chrome, or "15.15063" for Edge.
     */
    AWTSemanticContext.prototype.setDeviceBrowserVersion = function (deviceBrowserVersion) {
        if (this._allowDeviceFields) {
            this._addContext('DeviceInfo.BrowserVersion', deviceBrowserVersion);
        }
    };
    /**
     * Set the device manufacturer context information of telemetry event.
     * Can only be set at the LogManager level. Setting it via the object obtained from ILogger
     * will be no-op.
     * @param {string} deviceMake The manufacturer of the device, retrieved
     *            programmatically where possible and is app/platform specific
     */
    AWTSemanticContext.prototype.setDeviceMake = function (deviceMake) {
        if (this._allowDeviceFields) {
            this._addContext('DeviceInfo.Make', deviceMake);
        }
    };
    /**
     * Set the device model context information of telemetry event.
     * Can only be set at the LogManager level. Setting it via the object obtained from ILogger
     * will be no-op.
     * @param {string} deviceModel The model of the device, retrieved programmatically
     *            where possible and is app/platform specific
     */
    AWTSemanticContext.prototype.setDeviceModel = function (deviceModel) {
        if (this._allowDeviceFields) {
            this._addContext('DeviceInfo.Model', deviceModel);
        }
    };
    /**
     * Sets the field UserInfo.Id with the given value.
     * @param {string} userId     - The id uniquely identifies the user in an application-specific
     * user namespace, such as a Skype ID in the Skype App. This may be empty for Apps
     * which do not require user sign-in.
     * @param {enum} pii        - Optional pii type for the user id.
     * @param {enum} userIdType - Optional id type for the user id.
     */
    AWTSemanticContext.prototype.setUserId = function (userId, pii, userIdType) {
        if (!isNaN(userIdType) && userIdType !== null && userIdType >= 0 && userIdType <= 12) {
            this._addContext(UI_IDTYPE, userIdType.toString());
        }
        else {
            var inferredUserIdType = void 0;
            switch (pii) {
                case Enums_1.AWTPiiKind.SipAddress:
                    inferredUserIdType = Enums_2.AWTUserIdType.SipAddress;
                    break;
                case Enums_1.AWTPiiKind.PhoneNumber:
                    inferredUserIdType = Enums_2.AWTUserIdType.PhoneNumber;
                    break;
                case Enums_1.AWTPiiKind.SmtpAddress:
                    inferredUserIdType = Enums_2.AWTUserIdType.EmailAddress;
                    break;
                default:
                    inferredUserIdType = Enums_2.AWTUserIdType.Unknown;
                    break;
            }
            this._addContext(UI_IDTYPE, inferredUserIdType.toString());
        }
        if (isNaN(pii) || pii === null || pii === Enums_1.AWTPiiKind.NotSet || pii > 13) {
            switch (userIdType) {
                case Enums_2.AWTUserIdType.Skype:
                    pii = Enums_1.AWTPiiKind.Identity;
                    break;
                case Enums_2.AWTUserIdType.EmailAddress:
                    pii = Enums_1.AWTPiiKind.SmtpAddress;
                    break;
                case Enums_2.AWTUserIdType.PhoneNumber:
                    pii = Enums_1.AWTPiiKind.PhoneNumber;
                    break;
                case Enums_2.AWTUserIdType.SipAddress:
                    pii = Enums_1.AWTPiiKind.SipAddress;
                    break;
                default:
                    pii = Enums_1.AWTPiiKind.NotSet;
                    break;
            }
        }
        this._addContextWithPii('UserInfo.Id', userId, pii);
    };
    /**
     * Sets the field UserInfo.AdvertisingId with the given value.
     * @param {string} userAdvertisingId  - The AdvertisingId is the user-specific device id obtainable through
     * platform API's. This may not be available if users choose to opt-out
     * of this id, or if the underlying platform does not support it.
     */
    AWTSemanticContext.prototype.setUserAdvertisingId = function (userAdvertisingId) {
        this._addContext('UserInfo.AdvertisingId', userAdvertisingId);
    };
    /**
     * Sets the field UserInfo.TimeZone with the given value.
     * @param {string} userTimeZone  - The user's time zone relative to UTC, in ISO 8601 time zone format.
     * Examples of acceptable values include "+00", "+07:00", and "-1130".
     */
    AWTSemanticContext.prototype.setUserTimeZone = function (userTimeZone) {
        this._addContext('UserInfo.TimeZone', userTimeZone);
    };
    /**
     * Sets the field UserInfo.Language with the given value.
     * @param {string} userLanguage  - The user's language in IETF language tag format, as described in RFC 4646.
     * Examples of acceptable values include "en", "pt-BR" and "zh-Hant-CN".
     */
    AWTSemanticContext.prototype.setUserLanguage = function (userLanguage) {
        this._addContext('UserInfo.Language', userLanguage);
    };
    AWTSemanticContext.prototype._addContext = function (key, value) {
        if (typeof value === 'string') {
            this._properties.setProperty(key, value);
        }
    };
    AWTSemanticContext.prototype._addContextWithPii = function (key, value, pii) {
        if (typeof value === 'string') {
            this._properties.setPropertyWithPii(key, value, pii);
        }
    };
    return AWTSemanticContext;
}());
exports.default = AWTSemanticContext;
