/**
* AriaSDK.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
* File to export public classes, interfaces and enums.
*/
import { AWTPropertyType, AWTPiiKind, AWTEventPriority, AWTEventsDroppedReason, AWTEventsRejectedReason, AWTCustomerContentKind } from '../common/Enums';
import { AWTUserIdType, AWTSessionState } from './Enums';
import { AWTNotificationListener, AWTEventData, AWTEventProperty, AWTEventDataWithMetaData } from '../common/DataModels';
import { AWTLogConfiguration, AWTEventHandler, AWT_BEST_EFFORT, AWT_NEAR_REAL_TIME, AWT_REAL_TIME, AWTPropertyStorageOverride, AWTXHROverride } from './DataModels';
import AWTEventProperties from './AWTEventProperties';
import AWTLogger from './AWTLogger';
import AWTLogManager from './AWTLogManager';
import AWTTransmissionManager from './AWTTransmissionManager';
import AWTSerializer from '../common/AWTSerializer';
import AWTSemanticContext from './AWTSemanticContext';
export { AWTPropertyType, AWTPiiKind, AWTEventPriority, AWTEventData, AWTEventProperty, AWTEventsDroppedReason, AWTNotificationListener, AWTEventsRejectedReason, AWTEventProperties, AWTLogConfiguration, AWTLogger, AWTLogManager, AWT_BEST_EFFORT, AWT_NEAR_REAL_TIME, AWT_REAL_TIME, AWTEventHandler, AWTTransmissionManager, AWTSessionState, AWTUserIdType, AWTPropertyStorageOverride, AWTEventDataWithMetaData, AWTSerializer, AWTSemanticContext, AWTXHROverride, AWTCustomerContentKind };
export declare const AWT_COLLECTOR_URL_UNITED_STATES = "https://us.pipe.aria.microsoft.com/Collector/3.0/";
export declare const AWT_COLLECTOR_URL_GERMANY = "https://de.pipe.aria.microsoft.com/Collector/3.0/";
export declare const AWT_COLLECTOR_URL_JAPAN = "https://jp.pipe.aria.microsoft.com/Collector/3.0/";
export declare const AWT_COLLECTOR_URL_AUSTRALIA = "https://au.pipe.aria.microsoft.com/Collector/3.0/";
export declare const AWT_COLLECTOR_URL_EUROPE = "https://eu.pipe.aria.microsoft.com/Collector/3.0/";
export declare const AWT_COLLECTOR_URL_USGOV_DOD = "https://pf.pipe.aria.microsoft.com/Collector/3.0";
export declare const AWT_COLLECTOR_URL_USGOV_DOJ = "https://tb.pipe.aria.microsoft.com/Collector/3.0";
