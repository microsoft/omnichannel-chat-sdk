"use strict";
/**
* microsoft.bond.utils.ts
* Copyright: Microsoft 2016
*/
Object.defineProperty(exports, "__esModule", { value: true });
var BrowserChecker = /** @class */ (function () {
    function BrowserChecker() {
    }
    BrowserChecker._IsDataViewSupport = function () {
        return typeof ArrayBuffer !== 'undefined' &&
            typeof DataView !== 'undefined';
    };
    return BrowserChecker;
}());
exports.BrowserChecker = BrowserChecker;
