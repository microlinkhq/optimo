#!/usr/bin/env node
'use strict'

const { stat } = require('node:fs/promises')
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
      losy: 'l',
      mute: 'm',
      resize: 'r',
      silent: 's',
      verbose: 'v'
    }
  })

  const input = argv._[0]
  const dataUrl = argv['data-url'] === true
  const mute = argv.mute === undefined ? true : !['false', '0', 'no', 'off'].includes(String(argv.mute).toLowerCase())
  let resize = argv.resize

  if (resize !== undefined && resize !== null) {
    const unitToken = argv._[1]
    if (unitToken && /^[kmg]?b$/i.test(unitToken) && /^\d*\.?\d+$/.test(String(resize))) {
      resize = `${resize}${unitToken}`
    }
  }

  if (!input) {
    console.log(require('./help'))
    process.exit(0)
  }

  if (argv.verbose) {
    process.env.DEBUG = `${process.env.DEBUG ? `${process.env.DEBUG},` : ''}optimo*`
  }

  const stats = await stat(input)
  const isDirectory = stats.isDirectory()
  const fn = isDirectory ? require('optimo').dir : require('optimo').file

  const logger = argv.silent ? () => {} : logEntry => console.error(logEntry)
  !argv.silent && console.error()

  const result = await fn(input, {
    losy: argv.losy,
    mute,
    dryRun: argv['dry-run'],
    dataUrl,
    format: argv.format,
    resize,
    onLogs: logger
  })

  if (dataUrl && result?.dataUrl) {
    console.log(result.dataUrl)
  }

  if (result?.missingBinaries?.length > 0) {
    console.error()
    console.error(colors.gray('  Some files were skipped due to missing tools in the system:'))
    console.error()
    for (const name of result.missingBinaries) {
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
