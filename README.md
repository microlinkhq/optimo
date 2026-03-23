<div align="center">
  <br>
  <img style="width: 500px; margin:3rem 0 1.5rem;" src="https://github.com/microlinkhq/optimo/raw/master/examples/banner.jpg" alt="optimo">
  <br><br>
  <a href="https://microlink.io"><img src="https://img.shields.io/badge/powered_by-microlink.io-blue?style=flat-square&color=%23EA407B" alt="Powered by microlink.io"></a>
  <img alt="Last version" src="https://img.shields.io/github/tag/microlinkhq/optimo.svg?style=flat-square">
  <a href="https://www.npmjs.org/package/optimo"><img alt="NPM Status" src="https://img.shields.io/npm/dm/optimo.svg?style=flat-square"></a>
  <br><br>
  optimo reduces media file size aggressively, and safely.
</div>

## Highlights

- Format-specific tuning for stronger size reduction.
- Safety guard: if optimized output is not smaller, original file is kept.
- Backed by proven tools: ImageMagick, SVGO, Gifsicle, MozJPEG, and FFmpeg.
- Supports image and video optimization.
- Strips metadata by default for smaller outputs.
- Resizing supports percentage values (`50%`), max file size targets (`100kB`, images only), width (`w960`), & height (`h480`).

## Usage

```bash
npx -y optimo public/media            # for a directory
npx -y optimo public/media/banner.png # for a file
npx -y optimo public/media/banner.png --lossy # enable lossy + lossless mode
npx -y optimo public/media/banner.png --format jpeg # convert + optimize
npx -y optimo public/media/banner.png --resize 50% # resize + optimize
npx -y optimo public/media/banner.png --resize 100kB # resize to max file size
npx -y optimo public/media/banner.png --resize w960 # resize to max width
npx -y optimo public/media/banner.png --resize h480 # resize to max height
npx -y optimo public/media/banner.jpg --preserve-exif # keep EXIF metadata
npx -y optimo public/media/banner.png --data-url # print optimized image as data URL
npx -y optimo public/media/banner.heic --dry-run --verbose # inspect unsupported failures
npx -y optimo public/media/clip.mp4 # optimize a video
npx -y optimo public/media/clip.mp4 --mute # optimize and remove audio
npx -y optimo public/media/clip.mp4 --mute false # optimize video and keep audio
npx -y optimo public/media/clip.mov --format webm # convert + optimize video
```

## Pipelines

When `optimo` is executed, a pipeline of compressors is chosen based on the output file format:

- `.png` -> `magick.png`
- `.svg` -> `svgo.svg`
- `.jpg/.jpeg` -> `magick.jpg/jpeg` + `mozjpegtran.jpg/jpeg`
- `.gif` -> `magick.gif` + `gifsicle.gif`
- other image formats (`webp`, `avif`, `heic`, `heif`, `jxl`, etc.) -> `magick.<format>`
- video formats (`mp4`, `m4v`, `mov`, `webm`, `mkv`, `avi`, `ogv`) -> `ffmpeg.<format>`

Mode behavior:

- default: lossless-first pipeline.
- `-l, --lossy`: lossy + lossless pass per matching compressor.
- `-m, --mute`: remove audio tracks from video outputs (default: `true`; use `--mute false` to keep audio).
- `-p, --preserve-exif`: preserve EXIF metadata on image outputs (default: `false`).
- `-u, --data-url`: return optimized image as data URL (single file only; image only).
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
  lossy: false,
  preserveExif: false,
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

await optimo.file('/absolute/path/video.mp4', {
  lossy: true,
  // mute defaults to true for videos; set false to keep audio
  mute: false,
  format: 'webm',
  resize: 'w1280',
  onLogs: console.log
})

const { dataUrl } = await optimo.file('/absolute/path/image.jpg', {
  dataUrl: true,
  onLogs: console.log
})

console.log(dataUrl) // data:image/jpeg;base64,...

// optimize a dir recursively
const result = await optimo.dir('/absolute/path/images')

console.log(result)
// {
//   originalSize: Number,
//   optimizedSize: Number,
//   savings: Number
// }
```

## Benchmark

The table below compares optimo vs ImgBot:

| File          | Original size |                    ImgBot size |                       Optimo size |
| ------------- | ------------: | -----------------------------: | --------------------------------: |
| `banner.png`  |        897 KB |      718 KB (-179 KB, -19.92%) |       718 KB (-179 KB, -19.96%) 🏆 |
| `banner.jpg`  |        831 KB |      691 KB (-140 KB, -16.82%) |       691 KB (-140 KB, -16.83%) 🏆 |
| `banner.gif`  |        261 KB |         257 KB (-5 KB, -1.84%) |          255 KB (-6 KB, -2.39%) 🏆 |
| `banner.svg`  |        957 KB |          957 KB (0 KB, -0.01%) |           957 KB (0 KB, -0.02%) 🏆 |
| `banner.webp` |        541 KB |                  not supported |         519 KB (-22 KB, -4.07%) 🏆 |
| `banner.heic` |        398 KB |                  not supported |        304 KB (-94 KB, -23.62%) 🏆 |
| `banner.jxl`  |         48 KB |                  not supported |           46 KB (-2 KB, -4.17%) 🏆 |
| `banner.avif` |         20 KB |                  not supported |          17 KB (-3 KB, -15.00%) 🏆 |
| **Total**     |  **3,953 KB** | **3,630 KB (-323 KB, -8.17%)** | **3,507 KB (-446 KB, -11.28%) 🏆** |

## License

**optimo** © [Microlink](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/optimo/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Kiko Beats](https://kikobeats.com) with help from [contributors](https://github.com/microlinkhq/optimo/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlinkhq](https://github.com/microlinkhq) · X [@microlinkhq](https://x.com/microlinkhq)
