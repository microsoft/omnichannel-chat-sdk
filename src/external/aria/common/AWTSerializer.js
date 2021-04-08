"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* AWTSerializer.ts
* @author Brent Erickson (brericks) and Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
var Bond = require("../bond/microsoft.bond");
var Enums_1 = require("./Enums");
var AWTNotificationManager_1 = require("./AWTNotificationManager");
var Utils = require("./Utils");
var RequestSizeLimitBytes = 2936012; //approx 2.8 Mb
/**
* Class to handle serialization of event and request.
* Currently uses Bond for serialization. Please note that this may be subject to change.
*/
var AWTSerializer = /** @class */ (function () {
    function AWTSerializer() {
    }
    /**
     * Serialies a request using Bond.
     * @param {object} requestDictionary - A dictionary containing the token to event mapping.
     * @param {number} tokenCount        - Number of tenant tokens to be sent in the request.
     * @return {number[]} The serialized bond request.
     */
    AWTSerializer.getPayloadBlob = function (requestDictionary, tokenCount) {
        var requestFull = false;
        var remainingRequest;
        var stream = new Bond.IO.MemoryStream();
        var writer = new Bond.CompactBinaryProtocolWriter(stream);
        //Write TokenToDataPackagesMap
        writer._WriteFieldBegin(Bond._BondDataType._BT_MAP, 3, null);
        writer._WriteMapContainerBegin(tokenCount, Bond._BondDataType._BT_STRING, Bond._BondDataType._BT_LIST);
        for (var token in requestDictionary) {
            if (!requestFull) {
                if (requestDictionary.hasOwnProperty(token)) {
                    //write token
                    writer._WriteString(token);
                    var dataPackage = requestDictionary[token];
                    // Write list of DataPackages
                    writer._WriteContainerBegin(1, Bond._BondDataType._BT_STRUCT);
                    // Source
                    writer._WriteFieldBegin(Bond._BondDataType._BT_STRING, 2, null);
                    writer._WriteString('act_default_source');
                    // DataPackageId
                    writer._WriteFieldBegin(Bond._BondDataType._BT_STRING, 5, null);
                    writer._WriteString(Utils.newGuid());
                    // Timestamp
                    writer._WriteFieldBegin(Bond._BondDataType._BT_INT64, 6, null);
                    writer._WriteInt64(Utils.numberToBondInt64(Date.now()));
                    // Records
                    writer._WriteFieldBegin(Bond._BondDataType._BT_LIST, 8, null);
                    //Advance position by 1 for the elementy type which is always struct
                    var dpSizePos = stream._GetBuffer().length + 1;
                    writer._WriteContainerBegin(requestDictionary[token].length, Bond._BondDataType._BT_STRUCT);
                    var dpSizeSerialized = stream._GetBuffer().length - dpSizePos;
                    for (var i = 0; i < dataPackage.length; ++i) {
                        var currentStreamPos = stream._GetBuffer().length;
                        this.writeEvent(dataPackage[i], writer);
                        if (stream._GetBuffer().length - currentStreamPos > RequestSizeLimitBytes) {
                            //single event too big
                            AWTNotificationManager_1.default.eventsRejected([dataPackage[i]], Enums_1.AWTEventsRejectedReason.SizeLimitExceeded);
                            //move i one place back so that we can evaluate the next element once we delete the current element at pos i
                            dataPackage.splice(i--, 1);
                            stream._GetBuffer().splice(currentStreamPos);
                            //Bond serialization to change the datapackage length since we couldnt send this event
                            this._addNewDataPackageSize(dataPackage.length, stream, dpSizeSerialized, dpSizePos);
                            continue;
                        }
                        if (stream._GetBuffer().length > RequestSizeLimitBytes) {
                            //Adding this event exceeded the max request size. We should rever this event and send the serialized request.
                            //The remaining events should be returned to send in a separate request.
                            stream._GetBuffer().splice(currentStreamPos);
                            if (!remainingRequest) {
                                remainingRequest = {};
                            }
                            requestDictionary[token] = dataPackage.splice(0, i);
                            remainingRequest[token] = dataPackage;
                            this._addNewDataPackageSize(requestDictionary[token].length, stream, dpSizeSerialized, dpSizePos);
                            requestFull = true;
                            break;
                        }
                    }
                    writer._WriteStructEnd(false);
                }
            }
            else {
                if (!remainingRequest) {
                    remainingRequest = {};
                }
                remainingRequest[token] = requestDictionary[token];
                delete requestDictionary[token];
            }
        }
        // End ClientCollector
        writer._WriteStructEnd(false);
        return { payloadBlob: stream._GetBuffer(), remainingRequest: remainingRequest };
    };
    AWTSerializer._addNewDataPackageSize = function (size, stream, oldDpSize, streamPos) {
        //Bond serialization to change the datapackage length since we couldnt send everything
        var newRecordCountSerialized = Bond._Encoding._Varint_GetBytes(Bond.Number._ToUInt32(size));
        for (var j = 0; j < oldDpSize; ++j) {
            if (j < newRecordCountSerialized.length) {
                stream._GetBuffer()[streamPos + j] = newRecordCountSerialized[j];
            }
            else {
                stream._GetBuffer().slice(streamPos + j, oldDpSize - j);
                break;
            }
        }
    };
    /**
     * Bond serialize the event.
     * @param {object} eventData - The event that needs to be serialized.
     * @return {number[]} The serialized bond event.
     */
    AWTSerializer.writeEvent = function (eventData, writer) {
        // ID
        writer._WriteFieldBegin(Bond._BondDataType._BT_STRING, 1, null);
        writer._WriteString(eventData.id);
        // Timestamp
        writer._WriteFieldBegin(Bond._BondDataType._BT_INT64, 3, null);
        writer._WriteInt64(Utils.numberToBondInt64(eventData.timestamp));
        // Type
        writer._WriteFieldBegin(Bond._BondDataType._BT_STRING, 5, null);
        writer._WriteString(eventData.type);
        // Event Type
        writer._WriteFieldBegin(Bond._BondDataType._BT_STRING, 6, null);
        writer._WriteString(eventData.name);
        var propsString = {};
        var propStringCount = 0;
        var propsInt64 = {};
        var propInt64Count = 0;
        var propsDouble = {};
        var propDoubleCount = 0;
        var propsBool = {};
        var propBoolCount = 0;
        var propsDate = {};
        var propDateCount = 0;
        var piiProps = {};
        var piiPropCount = 0;
        var ccProps = {};
        var ccPropCount = 0;
        // Iterate across event data properties and separate based on pii
        for (var key in eventData.properties) {
            if (eventData.properties.hasOwnProperty(key)) {
                var property = eventData.properties[key];
                if (property.cc > 0) {
                    ccProps[key] = property;
                    ccPropCount++;
                }
                else if (property.pii > 0) {
                    piiProps[key] = property;
                    piiPropCount++;
                }
                else {
                    switch (property.type) {
                        case Enums_1.AWTPropertyType.String:
                            propsString[key] = property.value;
                            propStringCount++;
                            break;
                        case Enums_1.AWTPropertyType.Int64:
                            propsInt64[key] = property.value;
                            propInt64Count++;
                            break;
                        case Enums_1.AWTPropertyType.Double:
                            propsDouble[key] = property.value;
                            propDoubleCount++;
                            break;
                        case Enums_1.AWTPropertyType.Boolean:
                            propsBool[key] = property.value;
                            propBoolCount++;
                            break;
                        case Enums_1.AWTPropertyType.Date:
                            propsDate[key] = property.value;
                            propDateCount++;
                            break;
                    }
                }
            }
        }
        //Extension map
        if (propStringCount) {
            writer._WriteFieldBegin(Bond._BondDataType._BT_MAP, 13, null);
            writer._WriteMapContainerBegin(propStringCount, Bond._BondDataType._BT_STRING, Bond._BondDataType._BT_STRING);
            for (var key in propsString) {
                if (propsString.hasOwnProperty(key)) {
                    var value = propsString[key];
                    writer._WriteString(key);
                    writer._WriteString(value.toString());
                }
            }
        }
        // Pii
        if (piiPropCount) {
            writer._WriteFieldBegin(Bond._BondDataType._BT_MAP, 30, null);
            writer._WriteMapContainerBegin(piiPropCount, Bond._BondDataType._BT_STRING, Bond._BondDataType._BT_STRUCT);
            for (var key in piiProps) {
                if (piiProps.hasOwnProperty(key)) {
                    var property = piiProps[key];
                    writer._WriteString(key);
                    // PII Data
                    // O365 scrubber type
                    writer._WriteFieldBegin(Bond._BondDataType._BT_INT32, 1, null);
                    writer._WriteInt32(1);
                    // PII Kind
                    writer._WriteFieldBegin(Bond._BondDataType._BT_INT32, 2, null);
                    writer._WriteInt32(property.pii);
                    // Value
                    writer._WriteFieldBegin(Bond._BondDataType._BT_STRING, 3, null);
                    writer._WriteString(property.value.toString());
                    writer._WriteStructEnd(false);
                }
            }
        }
        // TypedExtensionBoolean map
        if (propBoolCount) {
            writer._WriteFieldBegin(Bond._BondDataType._BT_MAP, 31, null);
            writer._WriteMapContainerBegin(propBoolCount, Bond._BondDataType._BT_STRING, Bond._BondDataType._BT_BOOL);
            for (var key in propsBool) {
                if (propsBool.hasOwnProperty(key)) {
                    var value = propsBool[key];
                    writer._WriteString(key);
                    writer._WriteBool(value);
                }
            }
        }
        //TypedExtensionDateTime map
        if (propDateCount) {
            writer._WriteFieldBegin(Bond._BondDataType._BT_MAP, 32, null);
            writer._WriteMapContainerBegin(propDateCount, Bond._BondDataType._BT_STRING, Bond._BondDataType._BT_INT64);
            for (var key in propsDate) {
                if (propsDate.hasOwnProperty(key)) {
                    var value = propsDate[key];
                    writer._WriteString(key);
                    writer._WriteInt64(Utils.numberToBondInt64(value));
                }
            }
        }
        //TypedExtensionInt64 map
        if (propInt64Count) {
            writer._WriteFieldBegin(Bond._BondDataType._BT_MAP, 33, null);
            writer._WriteMapContainerBegin(propInt64Count, Bond._BondDataType._BT_STRING, Bond._BondDataType._BT_INT64);
            for (var key in propsInt64) {
                if (propsInt64.hasOwnProperty(key)) {
                    var value = propsInt64[key];
                    writer._WriteString(key);
                    writer._WriteInt64(Utils.numberToBondInt64(value));
                }
            }
        }
        //TypedExtensionDouble map
        if (propDoubleCount) {
            writer._WriteFieldBegin(Bond._BondDataType._BT_MAP, 34, null);
            writer._WriteMapContainerBegin(propDoubleCount, Bond._BondDataType._BT_STRING, Bond._BondDataType._BT_DOUBLE);
            for (var key in propsDouble) {
                if (propsDouble.hasOwnProperty(key)) {
                    var value = propsDouble[key];
                    writer._WriteString(key);
                    writer._WriteDouble(value);
                }
            }
        }
        //CustomerContentExtensions map
        if (ccPropCount) {
            writer._WriteFieldBegin(Bond._BondDataType._BT_MAP, 36, null);
            writer._WriteMapContainerBegin(ccPropCount, Bond._BondDataType._BT_STRING, Bond._BondDataType._BT_STRUCT);
            for (var key in ccProps) {
                if (ccProps.hasOwnProperty(key)) {
                    var property = ccProps[key];
                    writer._WriteString(key);
                    // CustomerContent Data
                    // CustomerContentKind
                    writer._WriteFieldBegin(Bond._BondDataType._BT_INT32, 1, null);
                    writer._WriteInt32(property.cc);
                    // RawContent
                    writer._WriteFieldBegin(Bond._BondDataType._BT_STRING, 2, null);
                    writer._WriteString(property.value.toString());
                    writer._WriteStructEnd(false);
                }
            }
        }
        writer._WriteStructEnd(false);
    };
    /**
     * Base64 encode the given number[].
     * @param {number[]} data - The data to be base64 encoded.
     * @return {string} The base64 encoded data.
     */
    AWTSerializer.base64Encode = function (data) {
        return Bond._Encoding._Base64_GetString(data);
    };
    return AWTSerializer;
}());
exports.default = AWTSerializer;
