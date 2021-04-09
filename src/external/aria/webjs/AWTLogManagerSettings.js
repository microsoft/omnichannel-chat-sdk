"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* AWTLogManagerSettings.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
var AWTEventProperties_1 = require("./AWTEventProperties");
var AWTSemanticContext_1 = require("./AWTSemanticContext");
/**
* Class that stores LogManagers context.
*/
var AWTLogManagerSettings = /** @class */ (function () {
    function AWTLogManagerSettings() {
    }
    AWTLogManagerSettings.logManagerContext = new AWTEventProperties_1.default();
    AWTLogManagerSettings.sessionEnabled = true;
    AWTLogManagerSettings.loggingEnabled = false;
    AWTLogManagerSettings.defaultTenantToken = '';
    AWTLogManagerSettings.semanticContext = new AWTSemanticContext_1.default(true, AWTLogManagerSettings.logManagerContext);
    return AWTLogManagerSettings;
}());
exports.default = AWTLogManagerSettings;
