#!/usr/bin/env node
'use strict'

const { stat } = require('node:fs/promises')
const colors = require('../src/util/colors')
const optimo = require('optimo')
const mri = require('mri')

async function main () {
  const argv = mri(process.argv.slice(2), {
    alias: {
      'dry-run': 'd',
      format: 'f',
      losy: 'l',
      resize: 'r',
      silent: 's',
      verbose: 'v'
    }
  })

  const input = argv._[0]
  let resize = argv.resize

  if (resize !== undefined && resize !== null) {
    const unitToken = argv._[1]
    if (
      unitToken &&
      /^[kmg]?b$/i.test(unitToken) &&
      /^\d*\.?\d+$/.test(String(resize))
    ) {
      resize = `${resize}${unitToken}`
    }
  }

  if (!input) {
    console.log(require('./help'))
    process.exit(0)
  }

  const stats = await stat(input)
  const isDirectory = stats.isDirectory()
  const fn = isDirectory ? optimo.dir : optimo.file

  if (argv.verbose) {
    process.env.DEBUG = `${
      process.env.DEBUG ? `${process.env.DEBUG},` : ''
    }optimo*`
  }

  const logger = argv.silent ? () => {} : logEntry => console.log(logEntry)
  !argv.silent && console.log()

  await fn(input, {
    losy: argv.losy,
    dryRun: argv['dry-run'],
    format: argv.format,
    resize,
    onLogs: logger
  })

  process.exit(0)
}

main().catch(error => {
  console.error(`${colors.red('Error:')} ${error.message}`)
  console.error(error.stack)
  process.exit(1)
})
