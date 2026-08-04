#!/usr/bin/env node
'use strict'

const { stat } = require('node:fs/promises')
const parseInputs = require('../src/util/parse-inputs')
const colors = require('../src/util/colors')
const mri = require('mri')

const INSTALL_HINTS = {
  svgo: 'brew install svgo',
  magick: 'brew install imagemagick',
  ffmpeg: 'brew install ffmpeg',
  gifsicle: 'brew install gifsicle',
  'mozjpegtran/jpegtran': 'brew install mozjpeg',
  'magick:jxl': 'brew install imagemagick-full && brew link --overwrite --force imagemagick-full'
}

async function main () {
  const argv = mri(process.argv.slice(2), {
    alias: {
      'data-url': 'u',
      'dry-run': 'd',
      format: 'f',
      lossy: 'l',
      losy: 'l',
      mute: 'm',
      'preserve-exif': 'p',
      resize: 'r',
      silent: 's',
      verbose: 'v'
    },
    boolean: ['lossy', 'losy', 'mute', 'preserve-exif']
  })

  const { inputs, resize } = parseInputs(argv._, argv.resize)
  const dataUrl = argv['data-url'] === true
  const lossy = argv.lossy === undefined ? argv.losy : argv.lossy
  const mute = argv.mute === undefined ? true : argv.mute
  const preserveExif = argv['preserve-exif'] === undefined ? false : argv['preserve-exif']

  if (inputs.length === 0) {
    console.log(require('./help'))
    process.exit(0)
  }

  if (dataUrl && inputs.length > 1) {
    throw new TypeError('Data URL output is only supported when optimizing a single image file.')
  }

  if (argv.verbose) {
    process.env.DEBUG = `${process.env.DEBUG ? `${process.env.DEBUG},` : ''}optimo*`
  }

  const logger = argv.silent ? () => {} : logEntry => console.error(logEntry)
  !argv.silent && console.error()

  const missingBinaries = new Set()

  for (const input of inputs) {
    const isDirectory = (await stat(input)).isDirectory()
    const fn = isDirectory ? require('optimo').dir : require('optimo').file

    const result = await fn(input, {
      lossy,
      mute,
      preserveExif,
      dryRun: argv['dry-run'],
      dataUrl,
      format: argv.format,
      resize,
      onLogs: logger
    })

    if (dataUrl && result?.dataUrl) console.log(result.dataUrl)
    result?.missingBinaries?.forEach(name => missingBinaries.add(name))
  }

  if (missingBinaries.size > 0) {
    console.error()
    console.error(colors.gray('  Some files were skipped due to missing tools in the system:'))
    console.error()
    for (const name of missingBinaries) {
      const hint = INSTALL_HINTS[name]
      console.error(
        colors.gray(
          `    ${name}: ${
            hint ? `Run \`${colors.white(hint)}\` to fix it` : 'install it and make sure it is available in $PATH'
          }`
        )
      )
    }
    process.exit(1)
  }

  process.exit(0)
}

main().catch(error => {
  console.error(`${colors.red('Error:')} ${error.message}`)
  console.error(error.stack)
  process.exit(1)
})
