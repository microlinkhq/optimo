'use strict'

const test = require('ava')
const colors = require('../../src/util/colors')

test('colors helpers return strings and label uppercases text', t => {
  t.is(typeof colors.gray('x'), 'string')
  t.is(typeof colors.white('x'), 'string')
  t.is(typeof colors.green('x'), 'string')
  t.is(typeof colors.red('x'), 'string')
  t.is(typeof colors.yellow('x'), 'string')
  t.is(typeof colors.blue('x'), 'string')

  const label = colors.label('optimo', 'blue')
  t.is(typeof label, 'string')
  t.true(label.includes('OPTIMO'))
})
