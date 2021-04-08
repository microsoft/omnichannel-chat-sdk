/**
* microsoft.bond.encoding.ts
* Copyright: Microsoft 2016
*/
import { Int64, UInt64 } from './microsoft.bond.primitives';
export declare function _Utf8_GetBytes(value: string): number[];
export declare function _Base64_GetString(inArray: number[]): string;
export declare function _Varint_GetBytes(value: number): number[];
export declare function _Varint64_GetBytes(value: UInt64): number[];
export declare function _Double_GetBytes(value: number): number[];
export declare function _Zigzag_EncodeZigzag32(value: number): number;
export declare function _Zigzag_EncodeZigzag64(value: Int64): UInt64;
