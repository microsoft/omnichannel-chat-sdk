"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* AriaSDK.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
* File to export public classes, interfaces and enums.
*/
var Enums_1 = require("../common/Enums");
exports.AWTPropertyType = Enums_1.AWTPropertyType;
exports.AWTPiiKind = Enums_1.AWTPiiKind;
exports.AWTEventPriority = Enums_1.AWTEventPriority;
exports.AWTEventsDroppedReason = Enums_1.AWTEventsDroppedReason;
exports.AWTEventsRejectedReason = Enums_1.AWTEventsRejectedReason;
exports.AWTCustomerContentKind = Enums_1.AWTCustomerContentKind;
var Enums_2 = require("./Enums");
exports.AWTUserIdType = Enums_2.AWTUserIdType;
exports.AWTSessionState = Enums_2.AWTSessionState;
var DataModels_1 = require("./DataModels");
exports.AWT_BEST_EFFORT = DataModels_1.AWT_BEST_EFFORT;
exports.AWT_NEAR_REAL_TIME = DataModels_1.AWT_NEAR_REAL_TIME;
exports.AWT_REAL_TIME = DataModels_1.AWT_REAL_TIME;
var AWTEventProperties_1 = require("./AWTEventProperties");
exports.AWTEventProperties = AWTEventProperties_1.default;
var AWTLogger_1 = require("./AWTLogger");
exports.AWTLogger = AWTLogger_1.default;
var AWTLogManager_1 = require("./AWTLogManager");
exports.AWTLogManager = AWTLogManager_1.default;
var AWTTransmissionManager_1 = require("./AWTTransmissionManager");
exports.AWTTransmissionManager = AWTTransmissionManager_1.default;
var AWTSerializer_1 = require("../common/AWTSerializer");
exports.AWTSerializer = AWTSerializer_1.default;
var AWTSemanticContext_1 = require("./AWTSemanticContext");
exports.AWTSemanticContext = AWTSemanticContext_1.default;
exports.AWT_COLLECTOR_URL_UNITED_STATES = 'https://us.pipe.aria.microsoft.com/Collector/3.0/';
exports.AWT_COLLECTOR_URL_GERMANY = 'https://de.pipe.aria.microsoft.com/Collector/3.0/';
exports.AWT_COLLECTOR_URL_JAPAN = 'https://jp.pipe.aria.microsoft.com/Collector/3.0/';
exports.AWT_COLLECTOR_URL_AUSTRALIA = 'https://au.pipe.aria.microsoft.com/Collector/3.0/';
exports.AWT_COLLECTOR_URL_EUROPE = 'https://eu.pipe.aria.microsoft.com/Collector/3.0/';
exports.AWT_COLLECTOR_URL_USGOV_DOD = 'https://pf.pipe.aria.microsoft.com/Collector/3.0';
exports.AWT_COLLECTOR_URL_USGOV_DOJ = 'https://tb.pipe.aria.microsoft.com/Collector/3.0';
