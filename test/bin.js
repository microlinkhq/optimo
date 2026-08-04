'use strict'

const test = require('ava').default
const path = require('node:path')
const $ = require('tinyspawn')

const CLI = path.resolve(__dirname, '../bin/index.js')

const optimo = args => $(`node ${CLI} ${args}`)

test('prints the help when no input is passed', async t => {
  const { stdout } = await optimo('')
  t.true(stdout.includes('Efortless media optimizer'))
})

test('rejects a data URL for more than one input', async t => {
  const error = await t.throwsAsync(optimo('logo.png hero.png --data-url'))
  t.true(error.stderr.includes('Data URL output is only supported when optimizing a single image file.'))
})

test('reports the first missing input', async t => {
  const error = await t.throwsAsync(optimo('does-not-exist.png other.png'))
  t.true(error.stderr.includes('does-not-exist.png'))
})
