'use strict'

const { gray, blue } = require('../src/colors')

module.exports = gray(`Efortless image optimizer

Usage
  $ ${blue('optimo')} <file|dir> [options]

Options
  -d, --dry-run  Show what would be optimized without making changes
  -f, --format   Convert output format (e.g. jpeg, webp, avif)
  -r, --resize   Resize by percentage (50%), size (100kB), width (w960), or height (h480)

Examples
  $ optimo image.jpg
  $ optimo image.png --dry-run
  $ optimo image.jpg -d
  $ optimo image.png -f jpeg
  $ optimo image.png -r 50%
  $ optimo image.png -r 100kB
  $ optimo image.png -r w960
  $ optimo image.png -r h480
`)
