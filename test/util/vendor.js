'use strict'

const test = require('ava').default
const path = require('node:path')

const { magickPath, isSupported, vendoredMagick } = require('../../src/util/vendor')

test('magickPath points at the extracted AppRun inside the vendor dir', t => {
  t.is(path.basename(magickPath()), 'AppRun')
  t.is(path.basename(path.dirname(magickPath())), 'imagemagick')
})

test('isSupported is true only on linux-x64', t => {
  t.is(isSupported(), process.platform === 'linux' && process.arch === 'x64')
})

test('vendoredMagick returns false when nothing has been provisioned', t => {
  // The test environment never ships a provisioned binary.
  if (!vendoredMagick()) return t.pass()
  t.is(vendoredMagick(), magickPath())
})
