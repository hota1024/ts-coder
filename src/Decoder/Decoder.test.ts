import { Encoder } from '.././Encoder'
import { Decoder } from './Decoder'

describe('Decoder class test', () => {
  test('should decode "hello world"', () => {
    const encoder = new Encoder({
      pid: 0x30,
      headSize: 4,
      preMap(buffer, index, buffers) {
        let status = 0x00

        if (index === buffers.length - 1) {
          status = 0x01
        }

        return Buffer.concat([Buffer.from([status, 0x00, 0x00, 0x00]), buffer])
      },
    })

    const packets = encoder.encode(Buffer.from('hello world'))

    const decoder = new Decoder({
      headSize: 4,
      isEnd(head) {
        return head[0] === 0x01
      },
    })

    decoder.onData((buffer) => {
      expect(buffer.slice(0, 11).toString()).toBe('hello world')
    })

    for (const packet of packets) {
      decoder.push(packet)
    }
  })
})
