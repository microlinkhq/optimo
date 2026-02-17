'use strict'

const test = require('ava')
const getOutputPath = require('../../src/util/get-output-path')

test('getOutputPath returns original path when format is empty', t => {
  t.is(getOutputPath('/tmp/image.png', undefined), '/tmp/image.png')
})

test('getOutputPath normalizes extension aliases and output path', t => {
  t.is(getOutputPath('/tmp/image.png', 'JPG'), '/tmp/image.jpeg')
  t.is(getOutputPath('/tmp/image.png', '.webp'), '/tmp/image.webp')
})
