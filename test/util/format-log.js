'use strict'

const test = require('ava')
const formatLog = require('../../src/util/format-log')

test('formatLog pads status and includes file path', t => {
  const output = formatLog('[ok]', value => value, '/tmp/image.png')

  t.true(output.startsWith('[ok]'))
  t.true(output.includes('/tmp/image.png'))
  t.true(output.includes('[ok]'.padEnd(13, ' ')))
})
