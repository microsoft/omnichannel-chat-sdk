/**
* InternalDataModels.ts
* @author  Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
* File containing the internal interfaces.
*/
import { AWTEventDataWithMetaData } from './DataModels';
/**
 * The is the object returned when serializing the request.
 * @property {number[]} payloadBlob - Serialized payload blob that needs to be sent.
 * @property {{ [token: string]: AWTEventDataWithMetaData[] }} remainingRequest - The remaning events in the request that were not
 * serialized because the request exceeded the maximum size. We will send this request separately.
 */
export interface AWTPayloadBlobWithMetadata {
    payloadBlob: number[];
    remainingRequest: {
        [token: string]: AWTEventDataWithMetaData[];
    };
}
