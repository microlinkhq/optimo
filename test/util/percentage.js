'use strict'

const test = require('ava')
const percentage = require('../../src/util/percentage')

test('percentage returns a single decimal string', t => {
  t.is(percentage(80, 100), '-20.0')
  t.is(percentage(100, 100), '0.0')
})
