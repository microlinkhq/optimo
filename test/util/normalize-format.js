'use strict'

const test = require('ava')
const normalizeFormat = require('../../src/util/normalize-format')

test('normalizeFormat normalizes extension aliases and casing', t => {
  t.is(normalizeFormat('.JPG'), 'jpeg')
  t.is(normalizeFormat(' tif '), 'tiff')
  t.is(normalizeFormat('webp'), 'webp')
  t.is(normalizeFormat(null), null)
})
