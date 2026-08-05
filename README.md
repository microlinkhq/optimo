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

Format-specific lossless behavior:

- `.png` — an alpha channel that is fully opaque carries no information, so it is dropped before encoding. This turns RGBA into RGB (25% fewer raw bytes) with zero pixel difference. Animated PNGs are still optimized; only this opaque-alpha removal is skipped for them.
- `.svg` — runs of whitespace inside `<title>` and `<desc>` are collapsed to a single space. This normalizes their text content; neither element is rendered as graphics, so the drawing is unaffected. Whitespace inside `<text>` is never touched.

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

| File          |  Original size |                      ImgBot size |                            Optimo size |
| ------------- | -------------: | -------------------------------: | -------------------------------------: |
| `banner.png`  |         897 KB |        718 KB (-179 KB, -19.92%) |            718 KB (-179 KB, -19.96%) 🏆 |
| `banner.jpg`  |         831 KB |        691 KB (-140 KB, -16.82%) |            691 KB (-140 KB, -16.83%) 🏆 |
| `banner.gif`  |         261 KB |           257 KB (-5 KB, -1.84%) |               255 KB (-6 KB, -2.39%) 🏆 |
| `banner.svg`  |         957 KB |            957 KB (0 KB, -0.01%) |                957 KB (0 KB, -0.02%) 🏆 |
| `banner.webp` |         541 KB |                                - |              519 KB (-22 KB, -4.07%) 🏆 |
| `banner.heic` |         398 KB |                                - |             304 KB (-94 KB, -23.62%) 🏆 |
| `banner.jxl`  |          48 KB |                                - |                46 KB (-2 KB, -4.17%) 🏆 |
| `banner.avif` |          20 KB |                                - |               17 KB (-3 KB, -15.00%) 🏆 |
| `banner.mp4`  |      16,552 KB |                                - |       1,877 KB (-14,675 KB, -88.65%) 🏆 |
| `banner.mov`  |      16,552 KB |                                - |       1,877 KB (-14,675 KB, -88.65%) 🏆 |
| `banner.mkv`  |      16,553 KB |                                - |       1,875 KB (-14,678 KB, -88.67%) 🏆 |
| `banner.webm` |      96,983 KB |                                - |       1,167 KB (-95,816 KB, -98.79%) 🏆 |
| **Total**     | **150,593 KB** | **150,270 KB (-323 KB, -0.21%)** | **10,303 KB (-140,290 KB, -93.16%) 🏆** |

### Head-to-head on real assets

The table above uses synthetic banners. The one below replays [microlinkhq/www#2183](https://github.com/microlinkhq/www/pull/2183), an ImgBot PR against a production site, and runs optimo on the exact same inputs. ImgBot's column reproduces the numbers from its own PR body.

| File | Original | ImgBot | optimo |
| ---- | -------: | -----: | -----: |
| `icons/costless.png` | 857,820 B | 763,258 B (-11.02%) | 763,082 B (-11.04%) 🏆 |
| `icons/cloud2.png` | 890,832 B | 794,240 B (-10.84%) | 794,064 B (-10.86%) 🏆 |
| `icons/programmable.png` | 889,264 B | 793,811 B (-10.73%) | 793,635 B (-10.75%) 🏆 |
| `icons/declarative.png` | 1,012,287 B | 914,434 B (-9.67%) | 914,258 B (-9.68%) 🏆 |
| `icons/developer.png` | 972,827 B | 878,894 B (-9.66%) | 878,718 B (-9.67%) 🏆 |
| `icons/cdn.png` | 1,044,729 B | 947,696 B (-9.29%) | 947,520 B (-9.30%) 🏆 |
| `icons/security.png` | 1,099,363 B | 997,970 B (-9.22%) | 997,794 B (-9.24%) 🏆 |
| `icons/hardware.png` | 1,408,313 B | 1,305,076 B (-7.33%) | 1,304,900 B (-7.34%) 🏆 |
| `gmail-bimi-brand-logo.png` | 423,636 B | 396,862 B (-6.32%) | 387,643 B (-8.50%) 🏆 |
| `use-cases/magnific.svg` | 377 B | 367 B (-2.65%) | 262 B (-30.50%) 🏆 |
| `bimi/adobe.svg` | 341 B | 340 B (-0.29%) | 340 B (-0.29%) 🤝 |
| **Total** | **8,599,789 B** | **7,792,948 B (-9.38%)** | **7,782,216 B (-9.51%)** 🏆 |

ImgBot runs the same underlying tools as optimo (ImageMagick, SVGO, MozJPEG, Gifsicle), so the gap on any single file comes down to how they are driven, not to a stronger compressor.

All nine PNG outputs above are pixel-identical to their inputs — `magick compare -metric AE` reports `0`. The two SVG outputs are not: SVGO's `preset-default` rounds path coordinates, which moves a small number of pixels once rasterized (`magick compare -metric AE` reports `99` of 2,304 for `magnific.svg`, and `0` for `adobe.svg`). That rounding is SVGO's default behavior and predates the transforms listed above.

## License

**optimo** © [Microlink](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/optimo/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Kiko Beats](https://kikobeats.com) with help from [contributors](https://github.com/microlinkhq/optimo/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlinkhq](https://github.com/microlinkhq) · X [@microlinkhq](https://x.com/microlinkhq)
