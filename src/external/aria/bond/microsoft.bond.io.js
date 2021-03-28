"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* microsoft.bond.io.ts
* Copyright: Microsoft 2016
*/
var microsoft_bond_primitives_1 = require("./microsoft.bond.primitives");
var MemoryStream = /** @class */ (function () {
    function MemoryStream() {
        this._buffer = [];
    }
    /*override*/
    MemoryStream.prototype._WriteByte = function (byte) {
        this._buffer.push(microsoft_bond_primitives_1.Number._ToByte(byte));
    };
    /*override*/
    MemoryStream.prototype._Write = function (buffer, offset, count) {
        while (count--) {
            this._WriteByte(buffer[offset++]);
        }
    };
    /**
     * Returns the array of unsigned bytes from which this stream was created.
     */
    MemoryStream.prototype._GetBuffer = function () {
        return this._buffer;
    };
    return MemoryStream;
}());
exports.MemoryStream = MemoryStream;
