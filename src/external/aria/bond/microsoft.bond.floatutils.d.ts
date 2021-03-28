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
export declare class FloatUtils {
    private static _floatZero;
    private static _doubleZero;
    private static _floatInifinity;
    private static _floatNegInifinity;
    private static _doubleInifinity;
    private static _doubleNegInifinity;
    static _ConvertNumberToArray(num: number, isDouble: boolean): number[];
}
