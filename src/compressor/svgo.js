'use strict'

const { unlink } = require('node:fs/promises')

const $ = require('tinyspawn')
const resolveBinary = require('../util/resolve-binary')

const binaryPath = resolveBinary('svgo')

const withMeta = (format, fn) => {
  const wrapped = async ctx => fn(ctx)
  wrapped.binaryName = 'svgo'
  wrapped.binaryPath = binaryPath
  wrapped.format = format
  return wrapped
}

const COMMON_PLUGINS = [
  'cleanupAttrs',
  'cleanupListOfValues',
  'cleanupNumericValues',
  'convertColors',
  'minifyStyles',
  'moveGroupAttrsToElems',
  'removeComments',
  'removeDoctype',
  'removeEditorsNSData',
  'removeEmptyAttrs',
  'removeEmptyContainers',
  'removeEmptyText',
  'removeNonInheritableGroupAttrs',
  'removeXMLProcInst',
  'sortAttrs'
]

const AGGRESSIVE_PLUGINS = COMMON_PLUGINS.concat([
  'cleanupEnableBackground',
  'cleanupIDs',
  'collapseGroups',
  'convertPathData',
  'convertShapeToPath',
  'convertTransform',
  'mergePaths',
  'moveElemsAttrsToGroup',
  'removeAttrs',
  'removeDesc',
  'removeDimensions',
  'removeElementsByAttr',
  'removeHiddenElems',
  'removeMetadata',
  'removeRasterImages',
  'removeStyleElement',
  'removeTitle',
  'removeUnknownsAndDefaults',
  'removeUnusedNS',
  'removeUselessDefs',
  'removeUselessStrokeAndFill',
  'removeViewBox',
  'removeXMLNS'
])

const run = async ({ inputPath, outputPath, plugins }) => {
  await $(binaryPath, [
    inputPath,
    '--config={"full":true}',
    '--multipass',
    `--enable=${plugins.join(',')}`,
    '--output',
    outputPath
  ])
}

const svg = withMeta(
  'svg',
  async ({ inputPath, outputPath, losy = false }) => {
    if (!losy) {
      await run({ inputPath, outputPath, plugins: COMMON_PLUGINS })
      return
    }

    const lossyPath = `${outputPath}.lossy.svg`
    try {
      await run({
        inputPath,
        outputPath: lossyPath,
        plugins: AGGRESSIVE_PLUGINS
      })
      await run({
        inputPath: lossyPath,
        outputPath,
        plugins: COMMON_PLUGINS
      })
    } finally {
      try {
        await unlink(lossyPath)
      } catch (error) {
        if (error.code !== 'ENOENT') {
          // Ignore cleanup failures.
        }
      }
    }
  }
)

module.exports = { binaryPath, svg }
