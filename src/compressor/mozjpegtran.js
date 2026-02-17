'use strict'

const $ = require('tinyspawn')
const resolveBinary = require('../util/resolve-binary')

const mozjpegtranPath =
  resolveBinary('mozjpegtran') || resolveBinary('jpegtran')

const withMeta = (format, fn) => {
  const wrapped = async ctx => fn(ctx)
  wrapped.binaryName = 'mozjpegtran'
  wrapped.binaryPath = mozjpegtranPath
  wrapped.getRequiredBinaries = () => [
    { name: 'mozjpegtran/jpegtran', binaryPath: mozjpegtranPath || false }
  ]
  wrapped.format = format
  return wrapped
}

const run = async ({ inputPath, outputPath }) =>
  $(mozjpegtranPath, [
    '-copy',
    'none',
    '-optimize',
    '-outfile',
    outputPath,
    inputPath
  ])

const jpg = withMeta('jpg', run)
const jpeg = withMeta('jpeg', run)

module.exports = { binaryPath: mozjpegtranPath, jpg, jpeg }
