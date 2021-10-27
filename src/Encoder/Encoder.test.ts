import { Encoder } from './Encoder'

describe('Encoder class test', () => {
  test('should encode "hello world"', () => {
    const encoder = new Encoder({
      pid: 0x30,
    })

    const buffer = Buffer.from('hello world')
    const packets = encoder.encode(buffer)

    expect(packets.length).toBe(1) // 1 packet

    const packet = packets[0]

    expect(packet.length).toBe(188) // 188 bytes

    expect(packet[0]).toBe(0x47) // sync byte
    expect(packet[1]).toBe(0x40) // tei, pusi, priority and shard of pid
    expect(packet[2]).toBe(0x30) // shard of pid
    expect(packet[3]).toBe(0x10) // tsc, afc, cc

    expect(packet.slice(4, 15).toString()).toBe('hello world')

    for(let i=16;i<188;i++) {
      expect(packet[i]).toBe(0xFF) // FF fill
    }
    expect(packet[188]).toBe(undefined)

  }),
  test('should encode 2chunk packet(185 Bytes)', () => {
    const encoder = new Encoder({
      pid: 0x30,
    })

    let longString =''
    for(let i=0;i<18;i++) {
      longString += "0123456789"
    }
    longString += "01234"

    const buffer = Buffer.from(longString)
    const packets = encoder.encode(buffer)

    expect(packets.length).toBe(1) // 1 packet

    const packet = packets[0]
    expect(packet.length).toBe(376) // 376 bytes

    expect(packet[0]).toBe(0x47) // sync byte
    expect(packet[1]).toBe(0x40) // tei, pusi, priority and shard of pid
    expect(packet[2]).toBe(0x30) // shard of pid
    expect(packet[3]).toBe(0x10) // tsc, afc, cc

    expect(packet.slice(4,188).toString()).toBe('0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123')

    expect(packet[188]).toBe(0x47) // sync byte
    expect(packet[189]).toBe(0x40) // tei, pusi, priority and shard of pid
    expect(packet[190]).toBe(0x30) // shard of pid
    expect(packet[191]).toBe(0x11) // tsc, afc, cc
    expect(packet[192]).toBe(0x34)
    expect(packet[193]).toBe(0xFF)
    expect(packet[375]).toBe(0xFF)
  }),
  test('should encode 2packets (184 * 348 + 1 Bytes)', () => {
    const encoder = new Encoder({
      pid: 0x30,
    })

    let string184 =''
    for(let i=0;i<18;i++) {
      string184 += "0123456789"
    }
    string184 += "0123"

    let string2packets = ''
    for(let i=0;i<348;i++) {
      string2packets += string184
    }
    string2packets += "A"

    const buffer = Buffer.from(string2packets)
    const packets = encoder.encode(buffer)

    expect(packets.length).toBe(2) // 1 packet
    expect(packets[0].length).toBe(65424) // 65536 bytes
    expect(packets[1].length).toBe(188) // 188 bytes

    const packet = packets[1]

    expect(packet[0]).toBe(0x47) // sync byte
    expect(packet[1]).toBe(0x40) // tei, pusi, priority and shard of pid
    expect(packet[2]).toBe(0x30) // shard of pid
    expect(packet[3]).toBe(0x1C) // tsc, afc, cc
    expect(packet[4]).toBe(0x41) // "A"
    expect(packet[5]).toBe(0xFF)
    expect(packet[187]).toBe(0xFF)
  }),
  test('should encode large packets', () => {
    const encoder = new Encoder({
      pid: 0x30,
    })

    let string184 =''
    for(let i=0;i<18;i++) {
      string184 += "0123456789"
    }
    string184 += "0123"

    let string1packets = ''
    for(let i=0;i<348;i++) {
      string1packets += string184
    }
    
    let string2packets = ''
    for(let i=0;i<1500;i++) {
      string2packets += string1packets
    }

    const buffer = Buffer.from(string2packets)
    const packets = encoder.encode(buffer)

    expect(packets.length).toBe(1500) // 1 packet
  })
})
