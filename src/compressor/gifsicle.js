'use strict'

const { unlink } = require('node:fs/promises')
const $ = require('tinyspawn')

const resolveBinary = require('../util/resolve-binary')

const binaryPath = resolveBinary('gifsicle')

const withMeta = (format, fn) => {
  const wrapped = async ctx => fn(ctx)
  wrapped.binaryName = 'gifsicle'
  wrapped.binaryPath = binaryPath
  wrapped.format = format
  return wrapped
}

const runLossless = async ({ inputPath, outputPath }) =>
  $(binaryPath, ['-O3', inputPath, '-o', outputPath])

const runLossy = async ({ inputPath, outputPath }) =>
  $(binaryPath, ['-O3', '--lossy=80', inputPath, '-o', outputPath])

const gif = withMeta('gif', async ({ inputPath, outputPath, losy = false }) => {
  if (!losy) return runLossless({ inputPath, outputPath })

  const lossyPath = `${outputPath}.lossy.gif`
  try {
    await runLossy({ inputPath, outputPath: lossyPath })
    return runLossless({ inputPath: lossyPath, outputPath })
  } finally {
    try {
      await unlink(lossyPath)
    } catch (error) {
      if (error.code !== 'ENOENT') {
        // Ignore cleanup failures.
      }
    }
  }
})

module.exports = { binaryPath, gif }
