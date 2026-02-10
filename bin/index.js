#!/usr/bin/env node
'use strict'

const { stat } = require('node:fs/promises')
const optimo = require('optimo')
const path = require('node:path')
const fs = require('node:fs')
const mri = require('mri')

const { formatBytes } = require('../src/util')
const colors = require('../src/colors')

async function main () {
  const argv = mri(process.argv.slice(2), {
    alias: {
      'dry-run': 'd',
      silent: 's'
    }
  })

  const input = argv._[0]

  if (!input) {
    console.log(fs.readFileSync(path.join(__dirname, 'help.txt'), 'utf8'))
    process.exit(0)
  }

  const stats = await stat(input)
  const isFolder = stats.isDirectory()
  const fn = isFolder ? optimo.folder : optimo.file

  const logger = argv.silent ? () => {} : logEntry => console.log(logEntry)
  !argv.silent && console.log()

  const result = await fn(input, {
    dryRun: argv['dry-run'],
    onLogs: logger
  })

  if (isFolder && !argv.silent && result.savings > 0) {
    const percentage = ((result.savings / result.originalSize) * 100).toFixed(1)
    logger()
    logger(
      `${formatBytes(result.originalSize)} → ${formatBytes(
        result.optimizedSize
      )} (-${percentage}%)`
    )
  }

  process.exit(0)
}

main().catch(error => {
  console.error(`${colors.red('Error:')} ${error.message}`)
  console.error(error.stack)
  process.exit(1)
})
