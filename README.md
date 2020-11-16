![ts-coder-thumbnail](https://user-images.githubusercontent.com/24543982/99226194-b11be700-282c-11eb-8900-4c04409d4bdd.png)
<div align="center">
<h1>▶▶▶ ts-coder ▶▶▶</h1>

**simple ts encoding/decoding library**

</div>

## ▶ About

`ts-coder` is a simple ts(transport streaming) file *encoding* and *decoding* library.

![ts-coder-encoding-and-decoding](https://user-images.githubusercontent.com/24543982/99229065-d7dc1c80-2830-11eb-9a2c-35c095ac8965.png)

## ➕ Installation

`ts-coder` can be installed using [npm](https://www.npmjs.com/package/ts-coder).

```bash
yarn add ts-coder # or npm install ts-coder
```

## 💡 How to use

### `data` ▶ `ts packets`

```ts
import { Encoder } from 'ts-coder'

const encoder = new Encoder({
  pid: 0x30, // packet identifier
})

const packets = encoder.encode(Buffer.from('hello world')) // encode "hello world" to ts packets
console.log(packets)
```

### `data` ◀ `ts packets`

```ts
import { Encoder, Decoder } from 'ts-coder'

// Encode part.

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

const packets = encoder.encode(Buffer.from("hello world"))

// Decode part.

const decoder = new Decoder({
  eadSize: 4,
  isEnd(head) {
    return head[0] === 0x01
  },
})

decoder.onData((buffer) => {
  console.log(buffer) // buffer with "hello world" string
})

for (const packet of packets) {
  decoder.push(packet)
}

```
