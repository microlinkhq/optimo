# optimo

`optimo` is an ImageMagick-powered CLI for aggressively reducing image file size with sane defaults.

- Optimizes a single file or a whole folder recursively.
- Keeps the original file when optimization is not smaller.
- Supports common web formats with format-specific presets.
- Falls back to a generic optimization preset for any other format ImageMagick can process.

## Requirements

- Node.js `>= 24`
- [ImageMagick](https://imagemagick.org) available as `magick` in `PATH`

## Install

```bash
npm install -g optimo
```

## CLI

```bash
optimo <path> [options]
```

`<path>` can be:

- An image file
- A folder (processed recursively)

Options:

- `-d, --dry-run`: show potential savings without replacing files
- `-s, --silent`: suppress per-file logs

Examples:

```bash
# optimize one image in place
optimo ./assets/hero.jpg

# preview changes only
optimo ./assets/logo.png --dry-run

# optimize all supported images in a folder recursively
optimo ./public/images

# optimize folder silently (only final summary when applicable)
optimo ./public/images --silent
```

## Supported Formats

Dedicated presets are applied for:

- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)
- AVIF (`.avif`)
- HEIC / HEIF (`.heic`, `.heif`)
- JPEG XL (`.jxl`)
- SVG (`.svg`)

All other extensions use a generic fallback preset. If ImageMagick cannot decode or encode a file, it is reported as unsupported and skipped.

## Optimization Strategy

- Compression-first per format.
- Metadata stripping (`-strip`) where applicable.
- Format-specific tuning for stronger size reduction.
- Safety guard: if optimized output is not smaller, original file is kept.

## Programmatic API

```js
const optimo = require('optimo')

// optimize a single file
await optimo.file('/absolute/path/image.jpg', {
  dryRun: false,
  onLogs: console.log
})

// optimize a folder recursively
const result = await optimo.folder('/absolute/path/images', {
  dryRun: true,
  onLogs: console.log
})

console.log(result)
// {
//   originalSize: Number,
//   optimizedSize: Number,
//   savings: Number
// }
```

## Notes

- Output quality and compression behavior depend on your local ImageMagick build and enabled codecs/delegates.
- AVIF/HEIC/JXL support requires ImageMagick to be compiled with those coders.

## License

MIT © [Kiko Beats](https://kikobeats.com)
