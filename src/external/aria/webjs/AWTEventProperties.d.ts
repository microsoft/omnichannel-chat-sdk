import { AWTPiiKind, AWTPropertyType, AWTEventPriority, AWTCustomerContentKind } from '../common/Enums';
import { AWTEventProperty, AWTEventData } from '../common/DataModels';
/**
* The AWTEventProperties class is used for creating an event.
*/
export default class AWTEventProperties {
    private _event;
    /**
     * The AWTEventProperties class constructor.
     * @constructor
     * @param {string} - [Optional] The name of the event.
     */
    constructor(name?: string);
    /**
     * Sets the name of the event.
     * @param {string} name - The name of the event.
     */
    setName(name: string): void;
    /**
     * Gets the name of the event.
     * @return {string|undefined} - The name of the event, or undefined if the name has not been set.
     */
    getName(): string | undefined;
    /**
     * Sets the base type of the event.
     * @param {string} type - The base type of the event.
     */
    setType(type: string): void;
    /**
     * Gets the base type of the event.
     * @return {string|undefined} The base type of the event, or undefined if the base type has not been set.
     */
    getType(): string | undefined;
    /**
     * Sets the timestamp for the event.
     * @param {number} timestampInEpochMillis - The timestamp (in milliseconds) since UNIX Epoch.
     */
    setTimestamp(timestampInEpochMillis: number): void;
    /**
     * Gets the timestamp for the event.
     * @return {number|undefined} The timestamp for the event, or undefined if it has not been set.
     */
    getTimestamp(): number | undefined;
    /**
     * Sets the priority for sending the event. The default priority
     * of the event is Normal.
     * @param {enum} priority - An AWTEventPriority enumeration value that specifies the priority of the event.
     */
    setEventPriority(priority: AWTEventPriority): void;
    /**
     * Gets the priority for the event.
     * @return {AWTEventPriority} - An AWTEventPriority enumeration value that specifies the priority of the event.
     */
    getEventPriority(): AWTEventPriority;
    /**
     * Sets a property with a name and value. Optionally sets the property type.
     * @param {string} name                      - The name of the property.
     * @param {string|number|boolean|Date} value - The property's value.
     * @param {enum} type                        - [Optional] One of the AWTPropertyType enumeration values that specifies
     * the type for the property.
     */
    setProperty(name: string, value: string | number | boolean | Date, type?: AWTPropertyType): void;
    /**
     * Sets a property with a name, a value, and a PII. Optionally sets the property type.
     * @param {string} name                      - The name of the property.
     * @param {string|number|boolean|Date} value - The property's value.
     * @param {enum} pii                         - The kind of PII for the property.
     * @param {enum} type                        - [Optional] One of the AWTPropertyType enumeration values that specifies
     * the type for the property.
     */
    setPropertyWithPii(name: string, value: string | number | boolean | Date, pii: AWTPiiKind, type?: AWTPropertyType): void;
    /**
     * Sets a property with name, value and customer content. Optionally set the property type of the value.
     * @param {string} name                      - The name of the property.
     * @param {string|number|boolean|Date} value - The property's value.
     * @param {enum} customerContent             - The customer content kind for the property.
     * @param {enum} type                        - [Optional] One of the AWTPropertyType enumeration values that specifies
     * the type for the property.
     */
    setPropertyWithCustomerContent(name: string, value: string | number | boolean | Date, customerContent: AWTCustomerContentKind, type?: AWTPropertyType): void;
    /**
     * Gets the properties currently added to the event.
     * @return {object} A Map<string, AWTEventProperty> containing the current properties.
     */
    getPropertyMap(): {
        readonly [name: string]: AWTEventProperty;
    };
    /**
     * Gets the event from this event properties object.
     * @return {object} The event properties compiled into AWTEventData.
     */
    getEvent(): AWTEventData;
}
