'use strict'

const { gray, blue } = require('../src/util/colors')

module.exports = gray(`Efortless media optimizer

Usage
  $ ${blue('optimo')} <file|dir> [options]

Options
  -l, --losy  Enable lossy + lossless passes (default: false)
  -m, --mute  Remove audio tracks from videos (default: true)
  -p, --preserve-exif  Preserve EXIF metadata (default: false)
  -u, --data-url  Return optimized image as data URL (file input only)
  -d, --dry-run  Show what would be optimized without making changes
  -f, --format   Convert output format (e.g. jpeg, webp, avif)
  -r, --resize   Resize by percentage (50%), size (100kB, images only), width (w960), or height (h480)
  -v, --verbose  Print debug logs (commands, pipeline, and errors)

Examples
  $ optimo image.jpg # optimize a single image in place
  $ optimo image.jpg --preserve-exif # keep EXIF metadata on output image
  $ optimo image.jpg --losy # run lossy + lossless optimization passes
  $ optimo clip.mp4 --mute # optimize video and remove audio track
  $ optimo clip.mp4 --mute false # optimize video and keep audio track
  $ optimo image.png --dry-run # preview optimization without writing files
  $ optimo image.jpg -d # short alias for dry-run preview mode
  $ optimo image.png -f jpeg # convert PNG to JPEG and optimize
  $ optimo image.png -r 50% # resize image to 50 percent then optimize
  $ optimo image.png -r 100kB # resize image to target max file size
  $ optimo image.png -r w960 # resize image to max width of 960px
  $ optimo image.png -r h480 # resize image to max height of 480px
  $ optimo image.png --data-url # output optimized image as data URL
  $ optimo image.heic -d -v # dry-run HEIC optimization with verbose logs
  $ optimo clip.mp4 # optimize a single video in place
  $ optimo clip.mov -f webm # convert MOV to WebM and optimize
`)
