"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* AWTAutoCollection.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2018
*/
var Utils = require("../common/Utils");
var DEVICE_ID_COOKIE = 'MicrosoftApplicationsTelemetryDeviceId';
var FIRSTLAUNCHTIME_COOKIE = 'MicrosoftApplicationsTelemetryFirstLaunchTime';
var BROWSERS = {
    MSIE: 'MSIE',
    CHROME: 'Chrome',
    FIREFOX: 'Firefox',
    SAFARI: 'Safari',
    EDGE: 'Edge',
    ELECTRON: 'Electron',
    SKYPE_SHELL: 'SkypeShell',
    PHANTOMJS: 'PhantomJS',
    OPERA: 'Opera'
};
var OPERATING_SYSTEMS = {
    WINDOWS: 'Windows',
    MACOSX: 'Mac OS X',
    WINDOWS_PHONE: 'Windows Phone',
    WINDOWS_RT: 'Windows RT',
    IOS: 'iOS',
    ANDROID: 'Android',
    LINUX: 'Linux',
    CROS: 'Chrome OS',
    UNKNOWN: 'Unknown'
};
var OSNAMEREGEX = {
    WIN: /(windows|win32)/i,
    WINRT: / arm;/i,
    WINPHONE: /windows\sphone\s\d+\.\d+/i,
    OSX: /(macintosh|mac os x)/i,
    IOS: /(iPad|iPhone|iPod)(?=.*like Mac OS X)/i,
    LINUX: /(linux|joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk)/i,
    ANDROID: /android/i,
    CROS: /CrOS/i
};
var VERSION_MAPPINGS = {
    '5.1': 'XP',
    '6.0': 'Vista',
    '6.1': '7',
    '6.2': '8',
    '6.3': '8.1',
    '10.0': '10'
};
var REGEX_VERSION = '([\\d,.]+)';
var REGEX_VERSION_MAC = '([\\d,_,.]+)';
var UNKNOWN = 'Unknown';
var UNDEFINED = 'undefined';
/**
 * Class that stores semantic properties.
 */
var AWTAutoCollection = /** @class */ (function () {
    function AWTAutoCollection() {
    }
    /**
     * Add a property storage override to override the usage of document.cookie to store
     * properties. The property storage object should implement both getProperty and setProperty, otherwise
     * it will be rejected.
     * @param {object} propertyStorage - Property storage object which is used for storing SDK properties.
     * @return {boolean} True if the property storage override was accepted, false otherwise.
     */
    AWTAutoCollection.addPropertyStorageOverride = function (propertyStorage) {
        if (propertyStorage) {
            this._propertyStorage = propertyStorage;
            return true;
        }
        return false;
    };
    /**
     * Auto collect semantic context properties.
     * @param {object} semantContext   - The semantic context to use to set auto collected information.
     * @param {boolean} disableCookies - Determines if setting cookies is disabled.
     * @param {object} userAgent       - UserAgent string to be used for auto collection of semantic properties.
     */
    AWTAutoCollection.autoCollect = function (semanticContext, disableCookies, userAgent) {
        this._semanticContext = semanticContext;
        this._disableCookies = disableCookies;
        this._autoCollect();
        if (!userAgent && typeof navigator !== UNDEFINED) {
            userAgent = navigator.userAgent || '';
        }
        this._autoCollectFromUserAgent(userAgent);
        if (this._disableCookies && !this._propertyStorage) {
            this._deleteCookie(DEVICE_ID_COOKIE);
            this._deleteCookie(FIRSTLAUNCHTIME_COOKIE);
            return;
        }
        //Only collect device id if it can be stored
        if (this._propertyStorage || (this._areCookiesAvailable && !this._disableCookies)) {
            this._autoCollectDeviceId();
        }
    };
    /**
     * Checks if the device id stored is the same as the new device id. If they are not,
     * store the new id and store a new first launch time.
     * @param {string} deviceId - The new device id.
     */
    AWTAutoCollection.checkAndSaveDeviceId = function (deviceId) {
        if (deviceId) {
            var oldDeviceId = this._getData(DEVICE_ID_COOKIE);
            var flt = this._getData(FIRSTLAUNCHTIME_COOKIE);
            if (oldDeviceId !== deviceId) {
                flt = Utils.getISOString(new Date());
            }
            this._saveData(DEVICE_ID_COOKIE, deviceId);
            this._saveData(FIRSTLAUNCHTIME_COOKIE, flt);
            this._setFirstLaunchTime(flt);
        }
    };
    /**
     * Auto collect the device SDK Id.
     */
    AWTAutoCollection._autoCollectDeviceId = function () {
        var deviceId = this._getData(DEVICE_ID_COOKIE);
        if (!deviceId) {
            deviceId = Utils.newGuid();
        }
        this._semanticContext.setDeviceId(deviceId);
    };
    AWTAutoCollection._autoCollect = function () {
        //Get app language
        if (typeof document !== UNDEFINED && document.documentElement) {
            this._semanticContext.setAppLanguage(document.documentElement.lang);
        }
        //Get user language
        if (typeof navigator !== UNDEFINED) {
            this._semanticContext.setUserLanguage(navigator.userLanguage || navigator.language);
        }
        //Get time zone
        var timeZone = new Date().getTimezoneOffset();
        var minutes = timeZone % 60;
        var hours = (timeZone - minutes) / 60;
        var timeZonePrefix = '+';
        if (hours > 0) {
            timeZonePrefix = '-';
        }
        hours = Math.abs(hours);
        minutes = Math.abs(minutes);
        this._semanticContext.setUserTimeZone(timeZonePrefix + (hours < 10 ? '0' + hours : hours.toString()) + ':'
            + (minutes < 10 ? '0' + minutes : minutes.toString()));
    };
    AWTAutoCollection._autoCollectFromUserAgent = function (userAgent) {
        if (userAgent) {
            var browserName = this._getBrowserName(userAgent);
            this._semanticContext.setDeviceBrowserName(browserName);
            this._semanticContext.setDeviceBrowserVersion(this._getBrowserVersion(userAgent, browserName));
            var osName = this._getOsName(userAgent);
            this._semanticContext.setDeviceOsName(osName);
            this._semanticContext.setDeviceOsVersion(this._getOsVersion(userAgent, osName));
        }
    };
    AWTAutoCollection._getBrowserName = function (userAgent) {
        //Check for Opera first
        if (this._userAgentContainsString('OPR/', userAgent)) {
            return BROWSERS.OPERA;
        }
        //Check for Phantom JS
        if (this._userAgentContainsString(BROWSERS.PHANTOMJS, userAgent)) {
            return BROWSERS.PHANTOMJS;
        }
        //Check for Edge
        if (this._userAgentContainsString(BROWSERS.EDGE, userAgent) || this._userAgentContainsString('Edg', userAgent)) {
            return BROWSERS.EDGE;
        }
        //Check for Electron
        if (this._userAgentContainsString(BROWSERS.ELECTRON, userAgent)) {
            return BROWSERS.ELECTRON;
        }
        //Check for Chrome
        if (this._userAgentContainsString(BROWSERS.CHROME, userAgent)) {
            return BROWSERS.CHROME;
        }
        //Check for Internet Explorer
        if (this._userAgentContainsString('Trident', userAgent)) {
            return BROWSERS.MSIE;
        }
        //Check for Firefox
        if (this._userAgentContainsString(BROWSERS.FIREFOX, userAgent)) {
            return BROWSERS.FIREFOX;
        }
        //Check for Safari
        if (this._userAgentContainsString(BROWSERS.SAFARI, userAgent)) {
            return BROWSERS.SAFARI;
        }
        //Check for Skype shell
        if (this._userAgentContainsString(BROWSERS.SKYPE_SHELL, userAgent)) {
            return BROWSERS.SKYPE_SHELL;
        }
        return UNKNOWN;
    };
    AWTAutoCollection._setFirstLaunchTime = function (flt) {
        if (!isNaN(flt)) {
            var fltDate = new Date();
            fltDate.setTime(parseInt(flt, 10));
            flt = Utils.getISOString(fltDate);
        }
        this.firstLaunchTime = flt;
    };
    AWTAutoCollection._userAgentContainsString = function (searchString, userAgent) {
        return userAgent.indexOf(searchString) > -1;
    };
    AWTAutoCollection._getBrowserVersion = function (userAgent, browserName) {
        if (browserName === BROWSERS.MSIE) {
            return this._getIeVersion(userAgent);
        }
        else if (browserName === BROWSERS.EDGE) {
            // Try to get the version of the old Edge first
            var version = this._getOtherVersion(browserName, userAgent);
            // If that returned unknown we should try the new Edge
            if (version === UNKNOWN) {
                return this._getOtherVersion('Edg', userAgent);
            }
            return version;
        }
        else {
            return this._getOtherVersion(browserName, userAgent);
        }
    };
    AWTAutoCollection._getIeVersion = function (userAgent) {
        var classicIeVersionMatches = userAgent.match(new RegExp(BROWSERS.MSIE + ' ' + REGEX_VERSION));
        if (classicIeVersionMatches) {
            return classicIeVersionMatches[1];
        }
        else {
            var ieVersionMatches = userAgent.match(new RegExp('rv:' + REGEX_VERSION));
            if (ieVersionMatches) {
                return ieVersionMatches[1];
            }
        }
    };
    AWTAutoCollection._getOtherVersion = function (browserString, userAgent) {
        if (browserString === BROWSERS.SAFARI) {
            browserString = 'Version';
        }
        var matches = userAgent.match(new RegExp(browserString + '/' + REGEX_VERSION));
        if (matches) {
            return matches[1];
        }
        return UNKNOWN;
    };
    AWTAutoCollection._getOsName = function (userAgent) {
        if (userAgent.match(OSNAMEREGEX.WINPHONE)) {
            return OPERATING_SYSTEMS.WINDOWS_PHONE;
        }
        if (userAgent.match(OSNAMEREGEX.WINRT)) {
            return OPERATING_SYSTEMS.WINDOWS_RT;
        }
        if (userAgent.match(OSNAMEREGEX.IOS)) {
            return OPERATING_SYSTEMS.IOS;
        }
        if (userAgent.match(OSNAMEREGEX.ANDROID)) {
            return OPERATING_SYSTEMS.ANDROID;
        }
        if (userAgent.match(OSNAMEREGEX.LINUX)) {
            return OPERATING_SYSTEMS.LINUX;
        }
        if (userAgent.match(OSNAMEREGEX.OSX)) {
            return OPERATING_SYSTEMS.MACOSX;
        }
        if (userAgent.match(OSNAMEREGEX.WIN)) {
            return OPERATING_SYSTEMS.WINDOWS;
        }
        if (userAgent.match(OSNAMEREGEX.CROS)) {
            return OPERATING_SYSTEMS.CROS;
        }
        return UNKNOWN;
    };
    AWTAutoCollection._getOsVersion = function (userAgent, osName) {
        if (osName === OPERATING_SYSTEMS.WINDOWS) {
            return this._getGenericOsVersion(userAgent, 'Windows NT');
        }
        if (osName === OPERATING_SYSTEMS.ANDROID) {
            return this._getGenericOsVersion(userAgent, osName);
        }
        if (osName === OPERATING_SYSTEMS.MACOSX) {
            return this._getMacOsxVersion(userAgent);
        }
        return UNKNOWN;
    };
    AWTAutoCollection._getGenericOsVersion = function (userAgent, osName) {
        var ntVersionMatches = userAgent.match(new RegExp(osName + ' ' + REGEX_VERSION));
        if (ntVersionMatches) {
            if (VERSION_MAPPINGS[ntVersionMatches[1]]) {
                return VERSION_MAPPINGS[ntVersionMatches[1]];
            }
            return ntVersionMatches[1];
        }
        return UNKNOWN;
    };
    AWTAutoCollection._getMacOsxVersion = function (userAgent) {
        var macOsxVersionInUserAgentMatches = userAgent.match(new RegExp(OPERATING_SYSTEMS.MACOSX + ' ' + REGEX_VERSION_MAC));
        if (macOsxVersionInUserAgentMatches) {
            var versionString = macOsxVersionInUserAgentMatches[1].replace(/_/g, '.');
            if (versionString) {
                var delimiter = this._getDelimiter(versionString);
                if (delimiter) {
                    var components = versionString.split(delimiter);
                    return components[0];
                }
                else {
                    return versionString;
                }
            }
        }
        return UNKNOWN;
    };
    AWTAutoCollection._getDelimiter = function (versionString) {
        if (versionString.indexOf('.') > -1) {
            return '.';
        }
        if (versionString.indexOf('_') > -1) {
            return '_';
        }
        return null;
    };
    AWTAutoCollection._saveData = function (name, value) {
        if (this._propertyStorage) {
            this._propertyStorage.setProperty(name, value);
        }
        else if (this._areCookiesAvailable) {
            //Expires in 365 days
            var date = new Date();
            date.setTime(date.getTime() + 31536000000 /*365 days in milliseconds*/);
            var expires = 'expires=' + date.toUTCString();
            document.cookie = name + '=' + value + '; ' + expires;
        }
    };
    AWTAutoCollection._getData = function (name) {
        if (this._propertyStorage) {
            return this._propertyStorage.getProperty(name) || '';
        }
        else if (this._areCookiesAvailable) {
            name = name + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                var j = 0;
                while (c.charAt(j) === ' ') {
                    j++;
                }
                c = c.substring(j);
                if (c.indexOf(name) === 0) {
                    return c.substring(name.length, c.length);
                }
            }
        }
        return '';
    };
    AWTAutoCollection._deleteCookie = function (name) {
        if (this._areCookiesAvailable) {
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
    };
    AWTAutoCollection._disableCookies = false;
    AWTAutoCollection._areCookiesAvailable = typeof document !== UNDEFINED && typeof document.cookie !== UNDEFINED;
    return AWTAutoCollection;
}());
exports.default = AWTAutoCollection;
