/**
 * Decoder#onData callback.
 */
export type DecoderOnDataCallback = (data: Buffer) => void

/**
 * Decoder interface.
 */
export interface IDecoder {
  /**
   * push ts buffer.
   *
   * @param buffer buffer of ts.
   */
  push(buffer: Buffer): void

  /**
   * call given callback when decoded data.
   *
   * @param callback on data callback.
   */
  onData(callback: DecoderOnDataCallback): void
}
