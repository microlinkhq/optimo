'use strict'

const test = require('ava').default

const parseInputs = require('../../src/util/parse-inputs')

test('returns every positional as an input', t => {
  t.deepEqual(parseInputs(['logo.png', 'hero.jpg', 'clip.mp4'], undefined), {
    inputs: ['logo.png', 'hero.jpg', 'clip.mp4'],
    resize: undefined
  })
})

test('returns no inputs when nothing is passed', t => {
  t.deepEqual(parseInputs([], undefined), { inputs: [], resize: undefined })
  t.deepEqual(parseInputs(undefined, undefined), { inputs: [], resize: undefined })
})

test('joins a resize value split from its unit token', t => {
  t.deepEqual(parseInputs(['logo.png', 'kB'], 100), {
    inputs: ['logo.png'],
    resize: '100kB'
  })
})

test('joins a split unit token keeping the remaining inputs', t => {
  t.deepEqual(parseInputs(['logo.png', 'kB', 'hero.jpg'], 100), {
    inputs: ['logo.png', 'hero.jpg'],
    resize: '100kB'
  })
})

test('keeps a file named like a unit token as an input', t => {
  t.deepEqual(parseInputs(['logo.png', 'kB'], undefined), {
    inputs: ['logo.png', 'kB'],
    resize: undefined
  })

  t.deepEqual(parseInputs(['logo.png', 'kB'], 'w960'), {
    inputs: ['logo.png', 'kB'],
    resize: 'w960'
  })
})

test('keeps a resize value that already carries its unit', t => {
  t.deepEqual(parseInputs(['logo.png', 'hero.jpg'], '100kB'), {
    inputs: ['logo.png', 'hero.jpg'],
    resize: '100kB'
  })
})
