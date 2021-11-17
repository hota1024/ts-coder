import { IEncoder } from './IEncoder'
import { chunkBuffer } from '../helpers'

/**
 * EncoderOptions type.
 */
export type EncoderOptions = {
  /**
   * packet identifier.
   */
  pid: number

  /**
   * head size(bytes).
   */
  headSize?: number

  /**
   * map buffers.
   *
   * @param buffer current buffer.
   * @param index current index.
   * @param buffers array of all buffers.
   */
  preMap?(buffer: Buffer, index: number, buffers: Buffer[]): Buffer
}

/**
 * Encoder class.
 */
export class Encoder implements IEncoder {
  /**
   * max size of ts file(bytes).
   */
  static readonly tsMaxSize: number = 65536

  /**
   * packet size(bytes).
   */
  static readonly packetSize: number = 188

  /**
   * ts header size(bytes).
   */
  static readonly headerSize: number = 4

  /**
   * payload size(bytes).
   */
  static readonly payloadSize: number = Encoder.packetSize - Encoder.headerSize

  /**
   * ts max packets.
   */
  static readonly tsMaxPackets: number = Math.floor(
    Encoder.tsMaxSize / Encoder.packetSize
  )

  /**
   * head size(bytes).
   */
  readonly headSize: number = 0

  /**
   * sync byte.
   */
  readonly syncByte: number = 0x47

  /**
   * max value of continuty counter.
   */
  readonly maxContinutyCounter: number = 16

  readonly preMap: (
    buffer: Buffer,
    index: number,
    buffers: Buffer[]
  ) => Buffer = (buffer) => buffer

  /**
   * packet identifier.
   */
  readonly pid: number

  constructor(options: EncoderOptions) {
    this.pid = options.pid
    this.headSize = options.headSize ?? this.headSize
    this.preMap = options.preMap ?? this.preMap
  }

  encode(buffer: Buffer): Buffer[] {
    const length = buffer.length
    let position = 0
    let packetList =[]
    let tsList=[]
    let counter = 0
    const rawBuffers = this.chunkRawBuffer(buffer)
    while(position < length) {
      const packet = this.createPacket(this.preMap(buffer.slice(position,position + Encoder.payloadSize - this.headSize), counter, rawBuffers),counter)
      packetList.push(packet)
      if(counter != 0 && (counter + 1) % (Encoder.tsMaxPackets) == 0){
        tsList.push(Buffer.concat(packetList))
        packetList = []
      }
      counter++
      position += Encoder.payloadSize - this.headSize
    }
    if(packetList.length > 0){
      tsList.push(Buffer.concat(packetList))
    }

    return tsList
  }

  /**
   * create a packet.
   *
   * @param buffer buffer.
   * @param counter counter.
   */
  private createPacket(buffer: Buffer, counter: number) {
    let header = Buffer.from([0x47,0x40,0x30,0x10])
    let packetBuffer = []
    header[3] += counter & 0x0f
    packetBuffer.push(header)
    packetBuffer.push(buffer)
    const fill = Buffer.alloc(Encoder.payloadSize - buffer.length)
    fill.fill(0xff)
    packetBuffer.push(fill)

    return Buffer.concat(packetBuffer)
  }
  
  /**
   * chunk given buffer.
   *
   * @param buffer buffer.
   */
  private chunkRawBuffer(buffer: Buffer) {
    const chunkSize = Encoder.payloadSize - this.headSize
    const chunked = chunkBuffer(buffer, chunkSize)

    return chunked
  }
}
