'use strict'

const test = require('ava')
const toDataUrl = require('../../src/util/to-data-url')

test('toDataUrl returns data URL with mime inferred from extension', t => {
  const content = Buffer.from('hello world')
  const value = toDataUrl({ filePath: '/tmp/image.jpg', content })

  t.true(value.startsWith('data:image/jpeg;base64,'))
})

test('toDataUrl falls back to octet-stream for unknown extension', t => {
  const content = Buffer.from('hello world')
  const value = toDataUrl({ filePath: '/tmp/image.unknown', content })

  t.true(value.startsWith('data:application/octet-stream;base64,'))
})
