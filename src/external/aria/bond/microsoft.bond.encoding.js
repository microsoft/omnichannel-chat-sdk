"use strict";
/**
* microsoft.bond.encoding.ts
* Copyright: Microsoft 2016
*/
Object.defineProperty(exports, "__esModule", { value: true });
var microsoft_bond_primitives_1 = require("./microsoft.bond.primitives");
var microsoft_bond_floatutils_1 = require("./microsoft.bond.floatutils");
var microsoft_bond_utils_1 = require("./microsoft.bond.utils");
function _Utf8_GetBytes(value) {
    var array = [];
    for (var i = 0; i < value.length; ++i) {
        var char = value.charCodeAt(i);
        if (char < 0x80) {
            array.push(char);
        }
        else if (char < 0x800) {
            array.push(0xc0 | (char >> 6), 0x80 | (char & 0x3f));
        }
        else if (char < 0xd800 || char >= 0xe000) {
            array.push(0xe0 | (char >> 12), 0x80 | ((char >> 6) & 0x3f), 0x80 | (char & 0x3f));
        }
        else {
            char = 0x10000 + (((char & 0x3ff) << 10) | (value.charCodeAt(++i) & 0x3ff));
            array.push(0xf0 | (char >> 18), 0x80 | ((char >> 12) & 0x3f), 0x80 | ((char >> 6) & 0x3f), 0x80 | (char & 0x3f));
        }
    }
    return array;
}
exports._Utf8_GetBytes = _Utf8_GetBytes;
function _Base64_GetString(inArray) {
    var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var output = [];
    var paddingBytes = inArray.length % 3;
    var toBase64 = function (num) {
        return [lookup.charAt((num >> 18) & 0x3F),
            lookup.charAt((num >> 12) & 0x3F),
            lookup.charAt((num >> 6) & 0x3F),
            lookup.charAt(num & 0x3F)].join('');
    };
    for (var i = 0, length_1 = inArray.length - paddingBytes; i < length_1; i += 3) {
        var temp = (inArray[i] << 16) + (inArray[i + 1] << 8) + (inArray[i + 2]);
        output.push(toBase64(temp));
    }
    switch (paddingBytes) {
        case 1:
            var temp = inArray[inArray.length - 1];
            output.push(lookup.charAt(temp >> 2));
            output.push(lookup.charAt((temp << 4) & 0x3F));
            output.push('==');
            break;
        case 2:
            var temp2 = (inArray[inArray.length - 2] << 8) + (inArray[inArray.length - 1]);
            output.push(lookup.charAt(temp2 >> 10));
            output.push(lookup.charAt((temp2 >> 4) & 0x3F));
            output.push(lookup.charAt((temp2 << 2) & 0x3F));
            output.push('=');
            break;
    }
    return output.join('');
}
exports._Base64_GetString = _Base64_GetString;
function _Varint_GetBytes(value) {
    var array = [];
    while (value & 0xffffff80) {
        array.push((value & 0x7f) | 0x80);
        value >>>= 7;
    }
    array.push(value & 0x7f);
    return array;
}
exports._Varint_GetBytes = _Varint_GetBytes;
function _Varint64_GetBytes(value) {
    var low = value.low;
    var high = value.high;
    var array = [];
    while (high || (0xffffff80 & low)) {
        array.push((low & 0x7f) | 0x80);
        low = ((high & 0x7f) << 25) | (low >>> 7);
        high >>>= 7;
    }
    array.push(low & 0x7f);
    return array;
}
exports._Varint64_GetBytes = _Varint64_GetBytes;
// Note: see notes of Float.
function _Double_GetBytes(value) {
    if (microsoft_bond_utils_1.BrowserChecker._IsDataViewSupport()) {
        var view = new DataView(new ArrayBuffer(8));
        view.setFloat64(0, value, true /*littleEndian*/);
        var array = [];
        for (var i = 0; i < 8; ++i) {
            array.push(view.getUint8(i));
        }
        return array;
    }
    else {
        return microsoft_bond_floatutils_1.FloatUtils._ConvertNumberToArray(value, true /*isDouble*/);
    }
}
exports._Double_GetBytes = _Double_GetBytes;
function _Zigzag_EncodeZigzag32(value) {
    value = microsoft_bond_primitives_1.Number._ToInt32(value);
    return ((value << 1) ^ (value >> (4 /*sizeof(int)*/ * 8 - 1)));
}
exports._Zigzag_EncodeZigzag32 = _Zigzag_EncodeZigzag32;
function _Zigzag_EncodeZigzag64(value) {
    var low = value.low;
    var high = value.high;
    var tmpH = (high << 1) | (low >>> 31);
    var tmpL = low << 1;
    if (high & 0x80000000) {
        tmpH = ~tmpH;
        tmpL = ~tmpL;
    }
    var res = new microsoft_bond_primitives_1.UInt64('0');
    res.low = tmpL;
    res.high = tmpH;
    return res;
}
exports._Zigzag_EncodeZigzag64 = _Zigzag_EncodeZigzag64;
