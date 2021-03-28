/**
* microsoft.bond.ts
* Copyright: Microsoft 2016
*/
import { _BondDataType } from './bond_const';
import _Encoding = require('./microsoft.bond.encoding');
import IO = require('./microsoft.bond.io');
import { Int64, UInt64, Number } from './microsoft.bond.primitives';
export { _BondDataType, _Encoding, IO, Int64, UInt64, Number };
export interface IBondSerializable {
    _Write(writer: IProtocolWriter): void;
}
/**
 * Declares the interface to be implemented by a protocol in order to
 * serialize Bond data.
 */
export interface IProtocolWriter {
    _WriteBlob(blob: number[]): void;
    _WriteBool(value: boolean): void;
    _WriteContainerBegin(size: number, elementType: _BondDataType): void;
    _WriteMapContainerBegin(size: number, keyType: _BondDataType, valueType: _BondDataType): void;
    _WriteDouble(value: number): void;
    _WriteFieldBegin(type: _BondDataType, id: number, metadata: IBondSerializable): void;
    _WriteInt32(value: number): void;
    _WriteInt64(value: Int64): void;
    _WriteString(value: string): void;
    _WriteStructEnd(isBase: boolean): void;
    _WriteUInt32(value: number): void;
    _WriteUInt64(value: UInt64): void;
    _WriteUInt8(value: number): void;
}
export declare class CompactBinaryProtocolWriter implements IProtocolWriter {
    constructor(stream: IO.Stream);
    _WriteBlob(blob: number[]): void;
    _WriteBool(value: boolean): void;
    _WriteContainerBegin(size: number, elementType: _BondDataType): void;
    _WriteMapContainerBegin(size: number, keyType: _BondDataType, valueType: _BondDataType): void;
    _WriteDouble(value: number): void;
    _WriteFieldBegin(type: _BondDataType, id: number, metadata: IBondSerializable): void;
    _WriteInt32(value: number): void;
    _WriteInt64(value: Int64): void;
    _WriteString(value: string): void;
    _WriteStructEnd(isBase: boolean): void;
    _WriteUInt32(value: number): void;
    _WriteUInt64(value: UInt64): void;
    _WriteUInt8(value: number): void;
    private _stream;
}
