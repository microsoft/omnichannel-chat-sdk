"use strict";
/**
* microsoft.bond.primitives.ts
* Copyright: Microsoft 2016
*/
Object.defineProperty(exports, "__esModule", { value: true });
var Int64 = /** @class */ (function () {
    function Int64(numberStr) {
        this.low = 0;
        this.high = 0;
        this.low = parseInt(numberStr, 10);
        if (this.low < 0) {
            this.high = -1;
        }
    }
    Int64.prototype._Equals = function (numberStr) {
        var tmp = new Int64(numberStr);
        return this.low === tmp.low && this.high === tmp.high;
    };
    return Int64;
}());
exports.Int64 = Int64;
var UInt64 = /** @class */ (function () {
    function UInt64(numberStr) {
        this.low = 0;
        this.high = 0;
        this.low = parseInt(numberStr, 10);
    }
    UInt64.prototype._Equals = function (numberStr) {
        var tmp = new UInt64(numberStr);
        return this.low === tmp.low && this.high === tmp.high;
    };
    return UInt64;
}());
exports.UInt64 = UInt64;
var Number = /** @class */ (function () {
    function Number() {
    }
    Number._ToByte = function (value) {
        return this._ToUInt8(value);
    };
    Number._ToUInt8 = function (value) {
        return value & 0xff;
    };
    Number._ToInt32 = function (value) {
        var signMask = (value & 0x80000000);
        return (value & 0x7fffffff) | signMask;
    };
    Number._ToUInt32 = function (value) {
        return value & 0xffffffff;
    };
    return Number;
}());
exports.Number = Number;
