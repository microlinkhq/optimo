#!/usr/bin/env node
'use strict'

const { stat } = require('node:fs/promises')
const colors = require('../src/util/colors')
const mri = require('mri')

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
  const mute =
    argv.mute === undefined
      ? true
      : !['false', '0', 'no', 'off'].includes(String(argv.mute).toLowerCase())
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

  process.exit(0)
}

main().catch(error => {
  console.error(`${colors.red('Error:')} ${error.message}`)
  console.error(error.stack)
  process.exit(1)
})
