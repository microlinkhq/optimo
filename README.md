<div align="center">
  <br>
  <img style="width: 500px; margin:3rem 0 1.5rem;" src="https://github.com/Kikobeats/optimo/raw/master/media/banner.jpg" alt="optimo">
  <br><br>
  <a href="https://microlink.io"><img src="https://img.shields.io/badge/powered_by-microlink.io-blue?style=flat-square&color=%23EA407B" alt="Powered by microlink.io"></a>
  <img alt="Last version" src="https://img.shields.io/github/tag/kikobeats/optimo.svg?style=flat-square">
  <a href="https://coveralls.io/github/kikobeats/optimo"><img alt="Coverage Status" src="https://img.shields.io/coveralls/kikobeats/optimo.svg?style=flat-square"></a>
  <a href="https://www.npmjs.org/package/optimo"><img alt="NPM Status" src="https://img.shields.io/npm/dm/optimo.svg?style=flat-square"></a>
  <br><br>
</div>

`optimo` is an CLI for aggressively reducing image file size with sane defaults. It's implemented on top of [ImageMagick](https://imagemagick.org/#gsc.tab=0).

## Install

```bash
npx -y optimo public/media            # for a directory
npx -y optimo public/media/banner.png # for a file
```

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

> [kikobeats.com](https://kikobeats.com) · GitHub [Kiko Beats](https://github.com/kikobeats) · Twitter [@kikobeats](https://twitter.com/kikobeats)
