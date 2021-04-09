/**
* AWTSerializer.ts
* @author Brent Erickson (brericks) and Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
import Bond = require('../bond/microsoft.bond');
import { AWTEventDataWithMetaData } from './DataModels';
import { AWTPayloadBlobWithMetadata } from './InternalDataModels';
/**
* Class to handle serialization of event and request.
* Currently uses Bond for serialization. Please note that this may be subject to change.
*/
export default class AWTSerializer {
    /**
     * Serialies a request using Bond.
     * @param {object} requestDictionary - A dictionary containing the token to event mapping.
     * @param {number} tokenCount        - Number of tenant tokens to be sent in the request.
     * @return {number[]} The serialized bond request.
     */
    static getPayloadBlob(requestDictionary: {
        [token: string]: AWTEventDataWithMetaData[];
    }, tokenCount: number): AWTPayloadBlobWithMetadata;
    private static _addNewDataPackageSize(size, stream, oldDpSize, streamPos);
    /**
     * Bond serialize the event.
     * @param {object} eventData - The event that needs to be serialized.
     * @return {number[]} The serialized bond event.
     */
    static writeEvent(eventData: AWTEventDataWithMetaData, writer: Bond.CompactBinaryProtocolWriter): void;
    /**
     * Base64 encode the given number[].
     * @param {number[]} data - The data to be base64 encoded.
     * @return {string} The base64 encoded data.
     */
    static base64Encode(data: number[]): string;
}
