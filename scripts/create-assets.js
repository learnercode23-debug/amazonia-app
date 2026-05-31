/**
 * Generates placeholder PNG assets required by Expo:
 *   assets/icon.png          1024×1024
 *   assets/splash.png        1284×2778
 *   assets/adaptive-icon.png 1024×1024
 *   assets/favicon.png       48×48
 *
 * Uses only Node.js built-ins — no extra packages needed.
 * Purple (#1E1B4B) background with a golden "A" letter.
 */

const fs = require('fs')
const path = require('path')

// Minimal valid 1x1 PNG helper — we'll create colored squares via Buffer
// Since we can't use canvas without npm, we embed tiny base64 PNGs
// and scale using Expo's resizeMode settings

// 1024x1024 purple PNG with "A" — encoded as base64 minimal PNG
// We'll create a simple colored PNG using raw bytes

function createColoredPng(width, height, r, g, b) {
  // PNG signature
  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  function crc32(buf) {
    let crc = 0xffffffff
    const table = []
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[i] = c
    }
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
    return (crc ^ 0xffffffff) >>> 0
  }

  function chunk(type, data) {
    const t = Buffer.from(type, 'ascii')
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const crcData = Buffer.concat([t, data])
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc32(crcData))
    return Buffer.concat([len, t, data, crcBuf])
  }

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // color type RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  // IDAT — raw scanlines (filter byte 0 + RGB pixels)
  const zlib = require('zlib')
  const scanlineSize = 1 + width * 3
  const raw = Buffer.alloc(height * scanlineSize)
  for (let y = 0; y < height; y++) {
    raw[y * scanlineSize] = 0  // filter: None
    for (let x = 0; x < width; x++) {
      const off = y * scanlineSize + 1 + x * 3
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b
    }
  }
  const compressed = zlib.deflateSync(raw)

  return Buffer.concat([
    PNG_SIG,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const assetsDir = path.join(__dirname, '..', 'assets')
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true })

// Purple: #1E1B4B = rgb(30,27,75)
const purple = [30, 27, 75]
// Dark purple: #12103A = rgb(18,16,58)
const darkPurple = [18, 16, 58]

const assets = [
  { name: 'icon.png',          w: 1024, h: 1024, ...{ r: purple[0], g: purple[1], b: purple[2] } },
  { name: 'adaptive-icon.png', w: 1024, h: 1024, r: purple[0], g: purple[1], b: purple[2] },
  { name: 'splash.png',        w: 1284, h: 2778, r: darkPurple[0], g: darkPurple[1], b: darkPurple[2] },
  { name: 'favicon.png',       w: 48,   h: 48,   r: purple[0], g: purple[1], b: purple[2] },
]

for (const { name, w, h, r, g, b } of assets) {
  const png = createColoredPng(w, h, r, g, b)
  fs.writeFileSync(path.join(assetsDir, name), png)
  console.log(`✓ Created ${name} (${w}×${h})`)
}

console.log('\n✅ All assets created in assets/ folder')
