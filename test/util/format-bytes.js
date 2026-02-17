'use strict'

const test = require('ava')
const formatBytes = require('../../src/util/format-bytes')

test('formatBytes formats values across units', t => {
  t.is(formatBytes(0), '0 B')
  t.is(formatBytes(1024), '1 KB')
  t.is(formatBytes(1536), '1.5 KB')
  t.is(formatBytes(1024 * 1024), '1 MB')
})
