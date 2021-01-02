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
 * DecoderPushResult type.
 */
export type DeocderPushResult =
  | {
      /**
       * whether decoded.
       */
      decoded: true

      /**
       * decoded data.
       */
      data: Buffer
    }
  | {
      /**
       * whether decoded.
       */
      decoded: false
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

  push(buffer: Buffer): DeocderPushResult {
    const packets = chunkBuffer(buffer, Encoder.packetSize)

    for (const packet of packets) {
      const payload = packet.slice(4)
      const head = payload.slice(0, this.headSize)
      const shard = payload.slice(this.headSize)
      this.buffers.push(shard)

      if (this.isEnd(head)) {
        const data = Buffer.from([...this.buffers])
        this.onDataCallbacks.forEach((fn) => fn(Buffer.concat(this.buffers)))
        this.buffers = []

        return {
          decoded: true,
          data,
        }
      }
    }

    return {
      decoded: false,
    }
  }

  onData(callback: DecoderOnDataCallback): void {
    this.onDataCallbacks.push(callback)
  }
}
