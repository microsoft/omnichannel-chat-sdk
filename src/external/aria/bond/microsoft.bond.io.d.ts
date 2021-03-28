export interface Stream {
    /**
     * Writes a byte to the current position in the stream and advances
     * the position with in the stream by one byte.
     */
    _WriteByte(byte: number): void;
    /**
     * When overriddden in a derived class, writes a sequence of bytes
     * to the current system and advances the current position within
     * this stream by the number of bytes written.
     *
     * @param buffer An array of bytes. This method copies count bytes
     *               from buffer to the current stream.
     * @param offset The zero-based byte offset in buffer at which to
     *               begin copying bytes to the current stream.
     * @param count  The number of bytes to be written to the current
     *               stream.
     */
    _Write(buffer: number[], offset: number, count: number): void;
}
export declare class MemoryStream {
    _WriteByte(byte: number): void;
    _Write(buffer: number[], offset: number, count: number): void;
    /**
     * Returns the array of unsigned bytes from which this stream was created.
     */
    _GetBuffer(): number[];
    private _buffer;
}
