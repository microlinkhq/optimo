'use strict'

const test = require('ava')
const parseResize = require('../../src/util/parse-resize')

test('parseResize returns null for empty values', t => {
  t.is(parseResize(undefined), null)
  t.is(parseResize(null), null)
  t.is(parseResize(''), null)
})

test('parseResize parses percentage resize values', t => {
  t.deepEqual(parseResize('50'), { mode: 'percentage', value: '50%' })
  t.deepEqual(parseResize('50%'), { mode: 'percentage', value: '50%' })
  t.deepEqual(parseResize(' 33.5% '), { mode: 'percentage', value: '33.5%' })
})

test('parseResize parses max-size resize values', t => {
  t.deepEqual(parseResize('100kB'), { mode: 'max-size', value: 102400 })
  t.deepEqual(parseResize('1 MB'), { mode: 'max-size', value: 1024 * 1024 })
  t.deepEqual(parseResize('2gb'), {
    mode: 'max-size',
    value: 2 * 1024 * 1024 * 1024
  })
})

test('parseResize parses width and height resize values', t => {
  t.deepEqual(parseResize('w960'), { mode: 'dimension', value: '960x' })
  t.deepEqual(parseResize('960w'), { mode: 'dimension', value: '960x' })
  t.deepEqual(parseResize('h480'), { mode: 'dimension', value: 'x480' })
  t.deepEqual(parseResize('480h'), { mode: 'dimension', value: 'x480' })
  t.deepEqual(parseResize(' W1280 '), { mode: 'dimension', value: '1280x' })
})

test('parseResize throws on zero width or height resize values', t => {
  const widthError = t.throws(() => parseResize('w0'))
  t.true(widthError instanceof TypeError)
  t.true(widthError.message.includes('width/height'))

  const heightError = t.throws(() => parseResize('h0'))
  t.true(heightError instanceof TypeError)
  t.true(heightError.message.includes('width/height'))
})

test('parseResize throws on zero max-size resize values', t => {
  const error = t.throws(() => parseResize('0kB'))
  t.true(error instanceof TypeError)
  t.true(error.message.includes('max size'))
})

test('parseResize throws on invalid input', t => {
  const error = t.throws(() => parseResize('invalid'))
  t.true(error instanceof TypeError)
  t.true(error.message.includes('Resize must be'))
})
