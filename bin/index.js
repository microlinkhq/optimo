#!/usr/bin/env node
'use strict'

const { stat } = require('node:fs/promises')
const optimo = require('optimo')
const mri = require('mri')

const colors = require('../src/colors')

async function main () {
  const argv = mri(process.argv.slice(2), {
    alias: {
      'dry-run': 'd',
      format: 'f',
      silent: 's'
    }
  })

  const input = argv._[0]

  if (!input) {
    console.log(require('./help'))
    process.exit(0)
  }

  const stats = await stat(input)
  const isDirectory = stats.isDirectory()
  const fn = isDirectory ? optimo.dir : optimo.file

  const logger = argv.silent ? () => {} : logEntry => console.log(logEntry)
  !argv.silent && console.log()

  await fn(input, {
    dryRun: argv['dry-run'],
    format: argv.format,
    onLogs: logger
  })

  process.exit(0)
}

main().catch(error => {
  console.error(`${colors.red('Error:')} ${error.message}`)
  console.error(error.stack)
  process.exit(1)
})
