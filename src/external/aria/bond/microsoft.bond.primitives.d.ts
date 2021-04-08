/**
* microsoft.bond.primitives.ts
* Copyright: Microsoft 2016
*/
export declare class Int64 {
    constructor(numberStr: string);
    _Equals(numberStr: string): boolean;
    low: number;
    high: number;
}
export declare class UInt64 {
    constructor(numberStr: string);
    _Equals(numberStr: string): boolean;
    low: number;
    high: number;
}
export declare class Number {
    static _ToByte(value: number): number;
    static _ToUInt8(value: number): number;
    static _ToInt32(value: number): number;
    static _ToUInt32(value: number): number;
}
