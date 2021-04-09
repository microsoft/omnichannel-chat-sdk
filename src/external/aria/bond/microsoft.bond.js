"use strict";
/**
* microsoft.bond.ts
* Copyright: Microsoft 2016
*/
Object.defineProperty(exports, "__esModule", { value: true });
var bond_const_1 = require("./bond_const");
exports._BondDataType = bond_const_1._BondDataType;
var _Encoding = require("./microsoft.bond.encoding");
exports._Encoding = _Encoding;
var IO = require("./microsoft.bond.io");
exports.IO = IO;
var microsoft_bond_primitives_1 = require("./microsoft.bond.primitives");
exports.Int64 = microsoft_bond_primitives_1.Int64;
exports.UInt64 = microsoft_bond_primitives_1.UInt64;
exports.Number = microsoft_bond_primitives_1.Number;
var CompactBinaryProtocolWriter = /** @class */ (function () {
    function CompactBinaryProtocolWriter(stream) {
        this._stream = stream;
    }
    /*override*/
    CompactBinaryProtocolWriter.prototype._WriteBlob = function (blob) {
        this._stream._Write(blob, 0, blob.length);
    };
    /*override*/
    CompactBinaryProtocolWriter.prototype._WriteBool = function (value) {
        this._stream._WriteByte(value ? 1 : 0);
    };
    /*override*/
    CompactBinaryProtocolWriter.prototype._WriteContainerBegin = function (size, elementType) {
        this._WriteUInt8(elementType);
        this._WriteUInt32(size);
    };
    /*override*/
    CompactBinaryProtocolWriter.prototype._WriteMapContainerBegin = function (size, keyType, valueType) {
        this._WriteUInt8(keyType);
        this._WriteUInt8(valueType);
        this._WriteUInt32(size);
    };
    /*override*/
    CompactBinaryProtocolWriter.prototype._WriteDouble = function (value) {
        var array = _Encoding._Double_GetBytes(value);
        this._stream._Write(array, 0, array.length);
    };
    /*override*/
    CompactBinaryProtocolWriter.prototype._WriteFieldBegin = function (type, id, metadata) {
        if (id <= 5) {
            this._stream._WriteByte(type | (id << 5));
        }
        else if (id <= 0xff) {
            this._stream._WriteByte(type | (6 << 5));
            this._stream._WriteByte(id);
        }
        else {
            this._stream._WriteByte(type | (7 << 5));
            this._stream._WriteByte(id);
            this._stream._WriteByte(id >> 8);
        }
    };
    /*override*/
    CompactBinaryProtocolWriter.prototype._WriteInt32 = function (value) {
        value = _Encoding._Zigzag_EncodeZigzag32(value);
        this._WriteUInt32(value);
    };
    /*override*/
    CompactBinaryProtocolWriter.prototype._WriteInt64 = function (value) {
        this._WriteUInt64(_Encoding._Zigzag_EncodeZigzag64(value));
    };
    /*override*/
    CompactBinaryProtocolWriter.prototype._WriteString = function (value) {
        if (value === '') {
            this._WriteUInt32(0 /*length*/);
        }
        else {
            var array = _Encoding._Utf8_GetBytes(value);
            this._WriteUInt32(array.length);
            this._stream._Write(array, 0, array.length);
        }
    };
    /*override*/
    CompactBinaryProtocolWriter.prototype._WriteStructEnd = function (isBase) {
        this._WriteUInt8(isBase ? bond_const_1._BondDataType._BT_STOP_BASE : bond_const_1._BondDataType._BT_STOP);
    };
    /*override*/
    CompactBinaryProtocolWriter.prototype._WriteUInt32 = function (value) {
        var array = _Encoding._Varint_GetBytes(microsoft_bond_primitives_1.Number._ToUInt32(value));
        this._stream._Write(array, 0, array.length);
    };
    /*override*/
    CompactBinaryProtocolWriter.prototype._WriteUInt64 = function (value) {
        var array = _Encoding._Varint64_GetBytes(value);
        this._stream._Write(array, 0, array.length);
    };
    /*override*/
    CompactBinaryProtocolWriter.prototype._WriteUInt8 = function (value) {
        this._stream._WriteByte(microsoft_bond_primitives_1.Number._ToUInt8(value));
    };
    return CompactBinaryProtocolWriter;
}());
exports.CompactBinaryProtocolWriter = CompactBinaryProtocolWriter;
