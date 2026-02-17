<div align="center">
  <br>
  <img style="width: 500px; margin:3rem 0 1.5rem;" src="https://github.com/Kikobeats/optimo/raw/master/media/banner.jpg" alt="optimo">
  <br><br>
  <a href="https://microlink.io"><img src="https://img.shields.io/badge/powered_by-microlink.io-blue?style=flat-square&color=%23EA407B" alt="Powered by microlink.io"></a>
  <img alt="Last version" src="https://img.shields.io/github/tag/kikobeats/optimo.svg?style=flat-square">
  <a href="https://www.npmjs.org/package/optimo"><img alt="NPM Status" src="https://img.shields.io/npm/dm/optimo.svg?style=flat-square"></a>
  <br><br>
</div>

`optimo` is an CLI for aggressively reducing image file size with sane defaults. It's implemented on top of [ImageMagick](https://imagemagick.org/#gsc.tab=0).

## Install

```bash
npx -y optimo public/media            # for a directory
npx -y optimo public/media/banner.png # for a file
npx -y optimo public/media/banner.png -f jpeg # convert + optimize
npx -y optimo public/media/banner.png -r 50% # resize + optimize
npx -y optimo public/media/banner.png -r 100kB # resize to max file size
npx -y optimo public/media/banner.png -r w960 # resize to max width
npx -y optimo public/media/banner.png -r h480 # resize to max height
```

## Highlights

- Metadata stripping.
- Compression-first per format.
- Format-specific tuning for stronger size reduction.
- Safety guard: if optimized output is not smaller, original file is kept.
- Resizing supports percentage values (`50%`), max file size targets (`100kB`), width (`w960`), & height (`h480`).

## Programmatic API

```js
const optimo = require('optimo')

// optimize a single file
await optimo.file('/absolute/path/image.jpg', {
  dryRun: false,
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
