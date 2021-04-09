"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* microsoft.bond.floatutils.ts
* Copyright: Microsoft 2016
*
* This class will be used to convert float/double to byte array on browsers which don't support html5.
*
* Format: IEEE-754, littleEndian, http://en.wikipedia.org/wiki/IEEE_754-1985
*
*  \note
* 1. Don't have negative zero. All zero will be positive zero.
* 2. If the buffer array passed to ConvertArrayToFloat() is actual NaN or Inifinity value,
*    exception will be raised.
*/
var FloatUtils = /** @class */ (function () {
    function FloatUtils() {
    }
    FloatUtils._ConvertNumberToArray = function (num, isDouble) {
        if (!num) {
            return isDouble ? this._doubleZero : this._floatZero;
        }
        var exponentBits = isDouble ? 11 : 8;
        var precisionBits = isDouble ? 52 : 23;
        // follow IEEE-754, exponent bias is 2^(k-1)-1 where k is the number of bits
        // in the exponent: http://en.wikipedia.org/wiki/Exponent_bias
        var bias = (1 << (exponentBits - 1)) - 1;
        var minExponent = 1 - bias;
        var maxExponent = bias;
        var sign = num < 0 ? 1 : 0;
        num = Math.abs(num);
        var intPart = Math.floor(num);
        var floatPart = num - intPart;
        var len = 2 * (bias + 2) + precisionBits;
        var buffer = new Array(len);
        var i = 0;
        while (i < len) {
            buffer[i++] = 0;
        }
        // caculate the intPart
        i = bias + 2;
        while (i && intPart) {
            buffer[--i] = intPart % 2;
            intPart = Math.floor(intPart / 2);
        }
        // caculate the floatPart
        i = bias + 1;
        while (i < len - 1 && floatPart > 0) {
            floatPart *= 2;
            if (floatPart >= 1) {
                buffer[++i] = 1;
                --floatPart;
            }
            else {
                buffer[++i] = 0;
            }
        }
        // find the first 1
        var firstBit = 0;
        while (firstBit < len && !buffer[firstBit]) {
            firstBit++;
        }
        // caculate exponent
        var exponent = bias + 1 - firstBit;
        // caculate round
        var lastBit = firstBit + precisionBits;
        if (buffer[lastBit + 1]) {
            for (i = lastBit; i > firstBit; --i) {
                buffer[i] = 1 - buffer[i];
                if (buffer) {
                    break;
                }
            }
            if (i === firstBit) {
                ++exponent;
            }
        }
        // check overflow
        if (exponent > maxExponent || intPart) {
            if (sign) {
                return isDouble ? this._doubleNegInifinity : this._floatNegInifinity;
            }
            else {
                return isDouble ? this._doubleInifinity : this._floatInifinity;
            }
        }
        else if (exponent < minExponent) {
            return isDouble ? this._doubleZero : this._floatZero;
        }
        // caculate the result
        if (isDouble) {
            var high = 0;
            for (i = 0; i < 20; ++i) {
                high = (high << 1) | buffer[++firstBit];
            }
            var low = 0;
            for (; i < 52; ++i) {
                low = (low << 1) | buffer[++firstBit];
            }
            high |= (exponent + bias) << 20;
            high = (sign << 31) | (high & 0x7FFFFFFF);
            var resArray = [low & 0xff, (low >> 8) & 0xff, (low >> 16) & 0xff, low >>> 24,
                high & 0xff, (high >> 8) & 0xff, (high >> 16) & 0xff, high >>> 24];
            return resArray;
        }
        else {
            var result = 0;
            for (i = 0; i < 23; ++i) {
                result = (result << 1) | buffer[++firstBit];
            }
            result |= (exponent + bias) << 23;
            result = (sign << 31) | (result & 0x7FFFFFFF);
            var resArray = [result & 0xff, (result >> 8) & 0xff, (result >> 16) & 0xff, result >>> 24];
            return resArray;
        }
    };
    FloatUtils._floatZero = [0x00, 0x00, 0x00, 0x00];
    FloatUtils._doubleZero = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    FloatUtils._floatInifinity = [0x00, 0x00, 0x80, 0x7F];
    FloatUtils._floatNegInifinity = [0x00, 0x00, 0x80, 0xFF];
    FloatUtils._doubleInifinity = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf0, 0x7f];
    FloatUtils._doubleNegInifinity = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf0, 0xff];
    return FloatUtils;
}());
exports.FloatUtils = FloatUtils;
