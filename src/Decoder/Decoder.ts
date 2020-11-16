import { Encoder } from '../Encoder'
import { chunkBuffer } from '../helpers'
import { DecoderOnDataCallback, IDecoder } from './IDecoder'

/**
 * DecoderOptions type.
 */
export type DecoderOptions = {
  /**
   * head size(bytes).
   */
  headSize?: number

  /**
   * returns whether packet is end of data.
   *
   * @param head head buffer.
   */
  isEnd(head: Buffer): boolean
}

/**
 * Decoder class.
 */
export class Decoder implements IDecoder {
  readonly headSize: number = 0

  private buffers: Buffer[] = []

  private readonly isEnd: DecoderOptions['isEnd']

  private readonly onDataCallbacks: DecoderOnDataCallback[] = []

  constructor(options: DecoderOptions) {
    this.headSize = options.headSize ?? this.headSize
    this.isEnd = options.isEnd
  }

  push(buffer: Buffer): void {
    const packets = chunkBuffer(buffer, Encoder.packetSize)

    for (const packet of packets) {
      const payload = packet.slice(4)
      const head = payload.slice(0, this.headSize)
      const shard = payload.slice(this.headSize)
      this.buffers.push(shard)

      if (this.isEnd(head)) {
        this.onDataCallbacks.forEach((fn) => fn(Buffer.concat(this.buffers)))
        this.buffers = []
      }
    }
  }

  onData(callback: DecoderOnDataCallback): void {
    this.onDataCallbacks.push(callback)
  }
}
