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

test('ensureBinaries returns missing binaries', t => {
  const missing = ensureBinaries([
    { name: 'magick', binaryPath: false },
    { name: 'svgo', binaryPath: false }
  ])

  t.is(missing.length, 2)
  t.is(missing[0].name, 'magick')
  t.is(missing[1].name, 'svgo')
})
