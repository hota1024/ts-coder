import { Encoder } from '@/Encoder/Encoder'

describe('Encoder class test', () => {
  test('should encode "hello world"', () => {
    const encoder = new Encoder({
      pid: 0x30,
    })

    const buffer = Buffer.from('hello world')
    const packets = encoder.encode(buffer)

    expect(packets.length).toBe(1) // 1 packet

    const packet = packets[0]

    expect(packet[0]).toBe(0x47) // sync byte
    expect(packet[1]).toBe(0x40) // tei, pusi, priority and shard of pid
    expect(packet[2]).toBe(0x30) // shard of pid
    expect(packet[3]).toBe(0x10) // tsc, afc, cc

    expect(packet.slice(4, 15).toString()).toBe('hello world')
  })
})
