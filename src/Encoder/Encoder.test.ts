import { Encoder } from './Encoder'

describe('Encoder class test', () => {
  test('should encode "hello world"', () => {
    const encoder = new Encoder({
      pid: 0x30,
      headSize: 4,
      preMap(buffer, index, buffers) {
        let status = 0x00
        if (index === buffers.length - 1) {
          status = 0x02
        }
        return Buffer.concat([Buffer.from([status, 0x00, 0x00, 0x00]), buffer])
      },
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

    expect(packet[4]).toBe(0x02) // stop status
    expect(packet[5]).toBe(0x0)
    expect(packet[6]).toBe(0x0)
    expect(packet[7]).toBe(0x0)

    expect(packet.slice(8, 19).toString()).toBe('hello world')

    for(let i=20;i<188;i++) {
      expect(packet[i]).toBe(0xFF) // FF fill
    }
    expect(packet[188]).toBe(undefined)

  }),
  test('should encode 2chunk packet(185 Bytes)', () => {
    const encoder = new Encoder({
      pid: 0x30,
      headSize: 4,
      preMap(buffer, index, buffers) {
        let status = 0x00
        if (index === buffers.length - 1) {
          status = 0x02
        }
        return Buffer.concat([Buffer.from([status, 0x00, 0x00, 0x00]), buffer])
      },
    })

    let longString =''
    for(let i=0;i<18;i++) {
      longString += "0123456789"
    }
    longString += "0"

    const buffer = Buffer.from(longString)
    const packets = encoder.encode(buffer)

    expect(packets.length).toBe(1) // 1 packet

    const packet = packets[0]
    expect(packet.length).toBe(376) // 376 bytes

    expect(packet[0]).toBe(0x47) // sync byte
    expect(packet[1]).toBe(0x40) // tei, pusi, priority and shard of pid
    expect(packet[2]).toBe(0x30) // shard of pid
    expect(packet[3]).toBe(0x10) // tsc, afc, cc
    expect(packet[4]).toBe(0x00) // stop status
    expect(packet[5]).toBe(0x0)
    expect(packet[6]).toBe(0x0)
    expect(packet[7]).toBe(0x0)

    expect(packet.slice(8,188).toString()).toBe('012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789')

    expect(packet[188]).toBe(0x47) // sync byte
    expect(packet[189]).toBe(0x40) // tei, pusi, priority and shard of pid
    expect(packet[190]).toBe(0x30) // shard of pid
    expect(packet[191]).toBe(0x11) // tsc, afc, cc
  
    expect(packet[192]).toBe(0x2) // stop status
    expect(packet[193]).toBe(0x0) 
    expect(packet[194]).toBe(0x0) 
    expect(packet[195]).toBe(0x0) 
    expect(packet[196]).toBe(0x30) // "0"

    expect(packet[197]).toBe(0xFF)
    expect(packet[375]).toBe(0xFF)

  }),
  test('should encode 2packets (184 * 348 + 1 Bytes)', () => {
    const encoder = new Encoder({
      pid: 0x30,
      headSize: 4,
      preMap(buffer, index, buffers) {
        let status = 0x00
        if (index === buffers.length - 1) {
          status = 0x02
        }
        return Buffer.concat([Buffer.from([status, 0x00, 0x00, 0x00]), buffer])
      },
    })

    let string180 =''
    for(let i=0;i<18;i++) {
      string180 += "0123456789"
    }

    let string2packets = ''
    for(let i=0;i<348;i++) {
      string2packets += string180
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
    expect(packet[4]).toBe(0x2) // stop status
    expect(packet[5]).toBe(0x0) 
    expect(packet[6]).toBe(0x0) 
    expect(packet[7]).toBe(0x0)
    expect(packet[8]).toBe(0x41) // "A"
    expect(packet[9]).toBe(0xFF) // FF fill
    expect(packet[187]).toBe(0xFF)
  }),
  test('should encode large packets', () => {
    const encoder = new Encoder({
      pid: 0x30,
      headSize: 4,
      preMap(buffer, index, buffers) {
        let status = 0x00
        if (index === buffers.length - 1) {
          status = 0x02
        }
        return Buffer.concat([Buffer.from([status, 0x00, 0x00, 0x00]), buffer])
      },
    })

    let string180 =''
    for(let i=0;i<18;i++) {
      string180 += "0123456789"
    }

    let string1packets = ''
    for(let i=0;i<348;i++) {
      string1packets += string180
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