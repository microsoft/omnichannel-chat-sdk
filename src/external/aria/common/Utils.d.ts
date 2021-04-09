/**
* Utils.ts
* @author  Brent Erickson (brericks) and Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
* File containing utility functions.
*/
import { Int64 } from '../bond/microsoft.bond.primitives';
import { AWTEventPriority } from './Enums';
import { AWTEventProperty } from './DataModels';
export declare const EventNameAndTypeRegex: RegExp;
export declare const EventNameDotRegex: RegExp;
export declare const PropertyNameRegex: RegExp;
export declare const StatsApiKey = "a387cfcf60114a43a7699f9fbb49289e-9bceb9fe-1c06-460f-96c5-6a0b247358bc-7238";
/**
 * Converts a number to Bond Int64.
 * @param {number} value - The number to be converted.
 * @return {object} The Int64 value for the passed number.
 */
export declare function numberToBondInt64(value: number): Int64;
/**
 * Creates a new GUID.
 * @return {string} A GUID.
 */
export declare function newGuid(): string;
/**
 * Checks if the type of value is a string.
 * @param {any} value - Value to be checked.
 * @return {boolean} True if the value is a string, false otherwise.
 */
export declare function isString(value: any): boolean;
/**
 * Checks if the type of value is a number.
 * @param {any} value - Value to be checked.
 * @return {boolean} True if the value is a number, false otherwise.
 */
export declare function isNumber(value: any): boolean;
/**
 * Checks if the type of value is a boolean.
 * @param {any} value - Value to be checked.
 * @return {boolean} True if the value is a boolean, false otherwise.
 */
export declare function isBoolean(value: any): boolean;
/**
 * Check if the type of value is a date.
 * @param {any} value - Value to be checked.
 * @return {boolean} True if the value is a date, false otherwise.
 */
export declare function isDate(value: any): boolean;
/**
 * Converts milliseconds to ticks since 00:00:00 Jan 1, 0001.
 * @param {number} msToTicks - The milliseconds value to be converted.
 * @return {number} The value of the milliseconds in .Net Ticks.
 */
export declare function msToTicks(timeInMs: number): number;
/**
 * Gets the tenant id from the tenant token.
 * @param {string} apiKey - The token from which the tenant id is to be extracted.
 * @return {string} The tenant id.
 */
export declare function getTenantId(apiKey: string): string;
/**
 * Checks if HTML5 Beacons are supported in the current environment.
 * @return {boolean} True if supported, false otherwise.
 */
export declare function isBeaconsSupported(): boolean;
/**
 * Checks if Uint8Array are available in the current environment. Safari and Firefox along with
 * ReactNative are known to not support Uint8Array properly.
 * @return {boolean} True if available, false otherwise.
 */
export declare function isUint8ArrayAvailable(): boolean;
/**
 * Checks if the value is an AWTEventPriority.
 * @param {enum} value - The value that needs to be checked.
 * @return {boolean} True if the value is in AWTEventPriority, false otherwise.
 */
export declare function isPriority(value: AWTEventPriority): boolean;
/**
 * Sanitizes the Property. It checks the that the property name and value are valid. It also
 * checks/populates the correct type and pii of the property value.
 * @param {string} name                                - The property name.
 * @param {string|number|boolean|Date|object} property - The property value or an AWTEventProperty containing value,
 * type ,pii and customer content.
 * @return {object} AWTEventProperty containing valid name, value, pii and type or null if invalid.
 */
export declare function sanitizeProperty(name: string, property: string | number | boolean | Date | AWTEventProperty): AWTEventProperty;
/**
 * Converts a date object into an ISO string. This is needed because not all browsers support ISO string format
 * on the date.
 * @param {object} date - The date which needs to be converted to ISO format.
 * @return {string} The date in ISO format.
 */
export declare function getISOString(date: Date): string;
export declare function useXDomainRequest(): boolean;
export declare function useFetchRequest(): boolean;
export declare function isReactNative(): boolean;
export declare function isServiceWorkerGlobalScope(): boolean;
