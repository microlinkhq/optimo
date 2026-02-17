<div align="center">
  <br>
  <img style="width: 500px; margin:3rem 0 1.5rem;" src="https://github.com/Kikobeats/optimo/raw/master/media/banner.jpg" alt="optimo">
  <br><br>
  <a href="https://microlink.io"><img src="https://img.shields.io/badge/powered_by-microlink.io-blue?style=flat-square&color=%23EA407B" alt="Powered by microlink.io"></a>
  <img alt="Last version" src="https://img.shields.io/github/tag/kikobeats/optimo.svg?style=flat-square">
  <a href="https://www.npmjs.org/package/optimo"><img alt="NPM Status" src="https://img.shields.io/npm/dm/optimo.svg?style=flat-square"></a>
  <br><br>
  optimo reduces image file size aggressively, and safely.
</div>

## Highlights

- Format-specific tuning for stronger size reduction.
- Safety guard: if optimized output is not smaller, original file is kept.
- Backed by proven tools: ImageMagick, SVGO, Gifsicle, and MozJPEG.
- Resizing supports percentage values (`50%`), max file size targets (`100kB`), width (`w960`), & height (`h480`).

## Usage

```bash
npx -y optimo public/media            # for a directory
npx -y optimo public/media/banner.png # for a file
npx -y optimo public/media/banner.png --losy # enable lossy + lossless mode
npx -y optimo public/media/banner.png --format jpeg # convert + optimize
npx -y optimo public/media/banner.png --resize 50% # resize + optimize
npx -y optimo public/media/banner.png --resize 100kB # resize to max file size
npx -y optimo public/media/banner.png --resize w960 # resize to max width
npx -y optimo public/media/banner.png --resize h480 # resize to max height
npx -y optimo public/media/banner.heic --dry-run --verbose # inspect unsupported failures
```

## Pipelines

When `optimo` is executed, a pipeline of compressors is chosen based on the output file format:

- `.png` -> `magick.png`
- `.svg` -> `svgo.svg`
- `.jpg/.jpeg` -> `magick.jpg/jpeg` + `mozjpegtran.jpg/jpeg`
- `.gif` -> `magick.gif` + `gifsicle.gif`
- other formats (`webp`, `avif`, `heic`, `heif`, `jxl`, etc.) -> `magick.<format>`

Mode behavior:

- default: lossless-first pipeline.
- `-l, --losy`: lossy + lossless pass per matching compressor.
- `-v, --verbose`: print debug logs (selected pipeline, binaries, executed commands, and errors).


Example output:

```
✓ banner.jpg  1.2MB → 348kB  (-71%)
```

If the optimized file isn’t smaller, the original is kept.

## Programmatic API

```js
const optimo = require('optimo')

// optimize a single file
await optimo.file('/absolute/path/image.jpg', {
  dryRun: false,
  losy: false,
  format: 'webp',
  resize: '50%',
  onLogs: console.log
})

await optimo.file('/absolute/path/image.jpg', {
  resize: '100kB',
  onLogs: console.log
})

await optimo.file('/absolute/path/image.jpg', {
  resize: 'w960',
  onLogs: console.log
})

// optimize a dir recursively
const result = await optimo.dir('/absolute/path/images')

console.log(result)
// {
//   originalSize: Number,
//   optimizedSize: Number,
//   savings: Number
// }
```

## License

**optimo** © [Microlink](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/optimo/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Kiko Beats](https://kikobeats.com) with help from [contributors](https://github.com/microlinkhq/optimo/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlinkhq](https://github.com/microlinkhq) · X [@microlinkhq](https://x.com/microlinkhq)
