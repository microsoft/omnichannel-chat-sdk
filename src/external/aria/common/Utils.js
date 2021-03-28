"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* Utils.ts
* @author  Brent Erickson (brericks) and Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
* File containing utility functions.
*/
var microsoft_bond_primitives_1 = require("../bond/microsoft.bond.primitives");
var Enums_1 = require("./Enums");
var GuidRegex = /[xy]/g;
var MSTillUnixEpoch = 62135596800000;
var MSToTicksMultiplier = 10000;
var NullValue = null;
exports.EventNameAndTypeRegex = /^[a-zA-Z]([a-zA-Z0-9]|_){2,98}[a-zA-Z0-9]$/;
exports.EventNameDotRegex = /\./g;
exports.PropertyNameRegex = /^[a-zA-Z](([a-zA-Z0-9|_|\.]){0,98}[a-zA-Z0-9])?$/;
exports.StatsApiKey = 'a387cfcf60114a43a7699f9fbb49289e-9bceb9fe-1c06-460f-96c5-6a0b247358bc-7238';
var beaconsSupported = NullValue;
var uInt8ArraySupported = NullValue;
var useXDR = NullValue;
/**
 * Converts a number to Bond Int64.
 * @param {number} value - The number to be converted.
 * @return {object} The Int64 value for the passed number.
 */
function numberToBondInt64(value) {
    // Construct bond timestamp for aria
    var bond_value = new microsoft_bond_primitives_1.Int64('0');
    bond_value.low = value & 0xffffffff;
    bond_value.high = Math.floor(value / 0x100000000);
    return bond_value;
}
exports.numberToBondInt64 = numberToBondInt64;
/**
 * Creates a new GUID.
 * @return {string} A GUID.
 */
function newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(GuidRegex, function (c) {
        var r = (Math.random() * 16 | 0), v = (c === 'x' ? r : r & 0x3 | 0x8);
        return v.toString(16);
    });
}
exports.newGuid = newGuid;
/**
 * Checks if the type of value is a string.
 * @param {any} value - Value to be checked.
 * @return {boolean} True if the value is a string, false otherwise.
 */
function isString(value) {
    return typeof value === 'string';
}
exports.isString = isString;
/**
 * Checks if the type of value is a number.
 * @param {any} value - Value to be checked.
 * @return {boolean} True if the value is a number, false otherwise.
 */
function isNumber(value) {
    return typeof value === 'number';
}
exports.isNumber = isNumber;
/**
 * Checks if the type of value is a boolean.
 * @param {any} value - Value to be checked.
 * @return {boolean} True if the value is a boolean, false otherwise.
 */
function isBoolean(value) {
    return typeof value === 'boolean';
}
exports.isBoolean = isBoolean;
/**
 * Check if the type of value is a date.
 * @param {any} value - Value to be checked.
 * @return {boolean} True if the value is a date, false otherwise.
 */
function isDate(value) {
    return value instanceof Date;
}
exports.isDate = isDate;
/**
 * Converts milliseconds to ticks since 00:00:00 Jan 1, 0001.
 * @param {number} msToTicks - The milliseconds value to be converted.
 * @return {number} The value of the milliseconds in .Net Ticks.
 */
function msToTicks(timeInMs) {
    return (timeInMs + MSTillUnixEpoch) * MSToTicksMultiplier;
}
exports.msToTicks = msToTicks;
/**
 * Gets the tenant id from the tenant token.
 * @param {string} apiKey - The token from which the tenant id is to be extracted.
 * @return {string} The tenant id.
 */
function getTenantId(apiKey) {
    var indexTenantId = apiKey.indexOf('-');
    if (indexTenantId > -1) {
        return apiKey.substring(0, indexTenantId);
    }
    return '';
}
exports.getTenantId = getTenantId;
/**
 * Checks if HTML5 Beacons are supported in the current environment.
 * @return {boolean} True if supported, false otherwise.
 */
function isBeaconsSupported() {
    if (beaconsSupported === NullValue) {
        beaconsSupported = typeof navigator !== 'undefined' && Boolean(navigator.sendBeacon);
    }
    return beaconsSupported;
}
exports.isBeaconsSupported = isBeaconsSupported;
/**
 * Checks if Uint8Array are available in the current environment. Safari and Firefox along with
 * ReactNative are known to not support Uint8Array properly.
 * @return {boolean} True if available, false otherwise.
 */
function isUint8ArrayAvailable() {
    if (uInt8ArraySupported === NullValue) {
        uInt8ArraySupported = typeof Uint8Array !== 'undefined' && !isSafariOrFirefox() && !isReactNative();
    }
    return uInt8ArraySupported;
}
exports.isUint8ArrayAvailable = isUint8ArrayAvailable;
/**
 * Checks if the value is an AWTEventPriority.
 * @param {enum} value - The value that needs to be checked.
 * @return {boolean} True if the value is in AWTEventPriority, false otherwise.
 */
function isPriority(value) {
    if (isNumber(value) && ((value >= 1 && value <= 3) || value === 5)) {
        return true;
    }
    return false;
}
exports.isPriority = isPriority;
/**
 * Sanitizes the Property. It checks the that the property name and value are valid. It also
 * checks/populates the correct type and pii of the property value.
 * @param {string} name                                - The property name.
 * @param {string|number|boolean|Date|object} property - The property value or an AWTEventProperty containing value,
 * type ,pii and customer content.
 * @return {object} AWTEventProperty containing valid name, value, pii and type or null if invalid.
 */
function sanitizeProperty(name, property) {
    //Check that property is valid
    if (!exports.PropertyNameRegex.test(name) || isNotDefined(property)) {
        return NullValue;
    }
    //Check if type is AWTEventProperty. If not convert to AWTEventProperty
    if (isNotDefined(property.value)) {
        property = { value: property, type: Enums_1.AWTPropertyType.Unspecified };
    }
    property.type = sanitizePropertyType(property.value, property.type);
    if (!property.type) {
        return NullValue;
    }
    //If value is date. Then convert to number in Ticks.
    if (isDate(property.value)) {
        property.value = msToTicks(property.value.getTime());
    }
    //Ensure that only one of pii or customer content can be set
    if (property.pii > 0 && property.cc > 0) {
        return NullValue;
    }
    //If pii is set we need to validate its enum value.
    if (property.pii) {
        return isPii(property.pii) ? property : NullValue;
    }
    //If cc is set we need to validate its enum value.
    if (property.cc) {
        return isCustomerContent(property.cc) ? property : NullValue;
    }
    return property;
}
exports.sanitizeProperty = sanitizeProperty;
/**
 * Converts a date object into an ISO string. This is needed because not all browsers support ISO string format
 * on the date.
 * @param {object} date - The date which needs to be converted to ISO format.
 * @return {string} The date in ISO format.
 */
function getISOString(date) {
    return date.getUTCFullYear() + '-' +
        twoDigit(date.getUTCMonth() + 1) + '-' +
        twoDigit(date.getUTCDate()) + 'T' +
        twoDigit(date.getUTCHours()) + ':' +
        twoDigit(date.getUTCMinutes()) + ':' +
        twoDigit(date.getUTCSeconds()) + '.' +
        threeDigit(date.getUTCMilliseconds()) + 'Z';
}
exports.getISOString = getISOString;
function useXDomainRequest() {
    if (useXDR === NullValue) {
        var conn = new XMLHttpRequest();
        if (typeof conn.withCredentials === 'undefined' &&
            typeof XDomainRequest !== 'undefined') {
            useXDR = true;
        }
        else {
            useXDR = false;
        }
    }
    return useXDR;
}
exports.useXDomainRequest = useXDomainRequest;
function useFetchRequest() {
    // Determine if fetch API should be used
    return isReactNative() || isServiceWorkerGlobalScope();
}
exports.useFetchRequest = useFetchRequest;
function isReactNative() {
    // If running in React Native, navigator.product will be populated
    if (typeof navigator !== 'undefined' && navigator.product) {
        return navigator.product === 'ReactNative';
    }
    return false;
}
exports.isReactNative = isReactNative;
function isServiceWorkerGlobalScope() {
    // If running in ServiceWorkerGlobalScope, self object should be defined
    if (typeof self === 'object') {
        return self.constructor.name === 'ServiceWorkerGlobalScope';
    }
    return false;
}
exports.isServiceWorkerGlobalScope = isServiceWorkerGlobalScope;
function twoDigit(n) {
    // Format integers to have at least two digits.
    return n < 10 ? '0' + n : n.toString();
}
function threeDigit(n) {
    // Format integers to have at least three digits.
    if (n < 10) {
        return '00' + n;
    }
    else if (n < 100) {
        return '0' + n;
    }
    return n.toString();
}
function sanitizePropertyType(value, type) {
    type = !isPropertyType(type) ? Enums_1.AWTPropertyType.Unspecified : type;
    switch (type) {
        case Enums_1.AWTPropertyType.Unspecified:
            return getCorrectType(value);
        case Enums_1.AWTPropertyType.String:
            return isString(value) ? type : NullValue;
        case Enums_1.AWTPropertyType.Boolean:
            return isBoolean(value) ? type : NullValue;
        case Enums_1.AWTPropertyType.Date:
            return isDate(value) && value.getTime() !== NaN ? type : NullValue;
        case Enums_1.AWTPropertyType.Int64:
            return isNumber(value) && value % 1 === 0 ? type : NullValue;
        case Enums_1.AWTPropertyType.Double:
            return isNumber(value) ? type : NullValue;
    }
    return NullValue;
}
function getCorrectType(value) {
    switch (typeof value) {
        case 'string':
            return Enums_1.AWTPropertyType.String;
        case 'boolean':
            return Enums_1.AWTPropertyType.Boolean;
        case 'number':
            return Enums_1.AWTPropertyType.Double;
        case 'object':
            return isDate(value) ? Enums_1.AWTPropertyType.Date : NullValue;
    }
    return NullValue;
}
function isPii(value) {
    if (isNumber(value) && value >= 0 && value <= 13) {
        return true;
    }
    return false;
}
function isCustomerContent(value) {
    if (isNumber(value) && value >= 0 && value <= 1) {
        return true;
    }
    return false;
}
function isPropertyType(value) {
    if (isNumber(value) && value >= 0 && value <= 4) {
        return true;
    }
    return false;
}
function isSafariOrFirefox() {
    // If non-browser navigator will be undefined
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
        var ua = navigator.userAgent.toLowerCase();
        if ((ua.indexOf('safari') >= 0 || ua.indexOf('firefox') >= 0) && ua.indexOf('chrome') < 0) {
            return true;
        }
    }
    return false;
}
function isNotDefined(value) {
    return value === undefined || value === NullValue || value === '';
}
