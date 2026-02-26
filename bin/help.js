'use strict'

const { gray, blue } = require('../src/util/colors')

module.exports = gray(`Efortless media optimizer

Usage
  $ ${blue('optimo')} <file|dir> [options]

Options
  -l, --losy  Enable lossy + lossless passes (default: false)
  -m, --mute  Remove audio tracks from videos (default: true)
  -d, --dry-run  Show what would be optimized without making changes
  -f, --format   Convert output format (e.g. jpeg, webp, avif)
  -r, --resize   Resize by percentage (50%), size (100kB, images only), width (w960), or height (h480)
  -v, --verbose  Print debug logs (commands, pipeline, and errors)

Examples
  $ optimo image.jpg
  $ optimo image.jpg --losy
  $ optimo clip.mp4 --mute
  $ optimo clip.mp4 --mute false
  $ optimo image.png --dry-run
  $ optimo image.jpg -d
  $ optimo image.png -f jpeg
  $ optimo image.png -r 50%
  $ optimo image.png -r 100kB
  $ optimo image.png -r w960
  $ optimo image.png -r h480
  $ optimo image.heic -d -v
  $ optimo clip.mp4
  $ optimo clip.mov -f webm
`)
