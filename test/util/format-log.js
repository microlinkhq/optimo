'use strict'

const test = require('ava')
const formatLog = require('../../src/util/format-log')

test('formatLog right-aligns status and includes file path', t => {
  const output = formatLog('[ok]', value => value, '/tmp/image.png')

  t.true(output.startsWith(' '.repeat(9) + '[ok]'))
  t.true(output.includes('/tmp/image.png'))
})
