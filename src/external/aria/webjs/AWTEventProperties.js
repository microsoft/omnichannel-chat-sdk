"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* AWTEventProperties.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2018
*/
var Utils = require("../common/Utils");
var Enums_1 = require("../common/Enums");
/**
* The AWTEventProperties class is used for creating an event.
*/
var AWTEventProperties = /** @class */ (function () {
    /**
     * The AWTEventProperties class constructor.
     * @constructor
     * @param {string} - [Optional] The name of the event.
     */
    function AWTEventProperties(name) {
        this._event = { name: '', properties: {} };
        if (name) {
            this.setName(name);
        }
    }
    /**
     * Sets the name of the event.
     * @param {string} name - The name of the event.
     */
    AWTEventProperties.prototype.setName = function (name) {
        this._event.name = name;
    };
    /**
     * Gets the name of the event.
     * @return {string|undefined} - The name of the event, or undefined if the name has not been set.
     */
    AWTEventProperties.prototype.getName = function () {
        return this._event.name;
    };
    /**
     * Sets the base type of the event.
     * @param {string} type - The base type of the event.
     */
    AWTEventProperties.prototype.setType = function (type) {
        this._event.type = type;
    };
    /**
     * Gets the base type of the event.
     * @return {string|undefined} The base type of the event, or undefined if the base type has not been set.
     */
    AWTEventProperties.prototype.getType = function () {
        return this._event.type;
    };
    /**
     * Sets the timestamp for the event.
     * @param {number} timestampInEpochMillis - The timestamp (in milliseconds) since UNIX Epoch.
     */
    AWTEventProperties.prototype.setTimestamp = function (timestampInEpochMillis) {
        this._event.timestamp = timestampInEpochMillis;
    };
    /**
     * Gets the timestamp for the event.
     * @return {number|undefined} The timestamp for the event, or undefined if it has not been set.
     */
    AWTEventProperties.prototype.getTimestamp = function () {
        return this._event.timestamp;
    };
    /**
     * Sets the priority for sending the event. The default priority
     * of the event is Normal.
     * @param {enum} priority - An AWTEventPriority enumeration value that specifies the priority of the event.
     */
    AWTEventProperties.prototype.setEventPriority = function (priority) {
        this._event.priority = priority;
    };
    /**
     * Gets the priority for the event.
     * @return {AWTEventPriority} - An AWTEventPriority enumeration value that specifies the priority of the event.
     */
    AWTEventProperties.prototype.getEventPriority = function () {
        return this._event.priority;
    };
    /**
     * Sets a property with a name and value. Optionally sets the property type.
     * @param {string} name                      - The name of the property.
     * @param {string|number|boolean|Date} value - The property's value.
     * @param {enum} type                        - [Optional] One of the AWTPropertyType enumeration values that specifies
     * the type for the property.
     */
    AWTEventProperties.prototype.setProperty = function (name, value, type) {
        if (type === void 0) { type = Enums_1.AWTPropertyType.Unspecified; }
        var property = { value: value, type: type, pii: Enums_1.AWTPiiKind.NotSet, cc: Enums_1.AWTCustomerContentKind.NotSet };
        property = Utils.sanitizeProperty(name, property);
        if (property === null) {
            delete this._event.properties[name];
            return;
        }
        this._event.properties[name] = property;
    };
    /**
     * Sets a property with a name, a value, and a PII. Optionally sets the property type.
     * @param {string} name                      - The name of the property.
     * @param {string|number|boolean|Date} value - The property's value.
     * @param {enum} pii                         - The kind of PII for the property.
     * @param {enum} type                        - [Optional] One of the AWTPropertyType enumeration values that specifies
     * the type for the property.
     */
    AWTEventProperties.prototype.setPropertyWithPii = function (name, value, pii, type) {
        if (type === void 0) { type = Enums_1.AWTPropertyType.Unspecified; }
        var property = { value: value, type: type, pii: pii, cc: Enums_1.AWTCustomerContentKind.NotSet };
        property = Utils.sanitizeProperty(name, property);
        if (property === null) {
            delete this._event.properties[name];
            return;
        }
        this._event.properties[name] = property;
    };
    /**
     * Sets a property with name, value and customer content. Optionally set the property type of the value.
     * @param {string} name                      - The name of the property.
     * @param {string|number|boolean|Date} value - The property's value.
     * @param {enum} customerContent             - The customer content kind for the property.
     * @param {enum} type                        - [Optional] One of the AWTPropertyType enumeration values that specifies
     * the type for the property.
     */
    AWTEventProperties.prototype.setPropertyWithCustomerContent = function (name, value, customerContent, type) {
        if (type === void 0) { type = Enums_1.AWTPropertyType.Unspecified; }
        var property = { value: value, type: type, pii: Enums_1.AWTPiiKind.NotSet, cc: customerContent };
        property = Utils.sanitizeProperty(name, property);
        if (property === null) {
            delete this._event.properties[name];
            return;
        }
        this._event.properties[name] = property;
    };
    /**
     * Gets the properties currently added to the event.
     * @return {object} A Map<string, AWTEventProperty> containing the current properties.
     */
    AWTEventProperties.prototype.getPropertyMap = function () {
        return this._event.properties;
    };
    /**
     * Gets the event from this event properties object.
     * @return {object} The event properties compiled into AWTEventData.
     */
    AWTEventProperties.prototype.getEvent = function () {
        return this._event;
    };
    return AWTEventProperties;
}());
exports.default = AWTEventProperties;
