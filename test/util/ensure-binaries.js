'use strict'

const test = require('ava')
const ensureBinaries = require('../../src/util/ensure-binaries')

test('ensureBinaries does not throw when all binaries are present', t => {
  t.notThrows(() =>
    ensureBinaries([
      { name: 'magick', binaryPath: '/usr/bin/magick' },
      { name: 'svgo', binaryPath: '/usr/bin/svgo' }
    ])
  )
})

test('ensureBinaries throws with missing binary names', t => {
  const error = t.throws(() =>
    ensureBinaries([
      { name: 'magick', binaryPath: false },
      { name: 'svgo', binaryPath: false }
    ])
  )

  t.true(error instanceof Error)
  t.true(error.message.includes('Missing required binaries'))
  t.true(error.message.includes('magick'))
  t.true(error.message.includes('svgo'))
})
