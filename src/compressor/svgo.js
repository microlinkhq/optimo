'use strict'

const { writeFile, unlink } = require('node:fs/promises')
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

const EXTRA_COMMON_PLUGINS = [
  'cleanupListOfValues'
]

const EXTRA_AGGRESSIVE_PLUGINS = EXTRA_COMMON_PLUGINS.concat([
  'removeAttrs',
  'removeDimensions',
  'removeElementsByAttr',
  'removeRasterImages',
  'removeStyleElement',
  'removeTitle',
  'removeViewBox',
  'removeXMLNS'
])

const buildConfigContent = plugins =>
  `module.exports = ${JSON.stringify({ multipass: true, plugins: ['preset-default', ...plugins] })}\n`

const run = async ({ inputPath, outputPath, extraPlugins }) => {
  const configPath = `${outputPath}.svgo.config.cjs`
  try {
    await writeFile(configPath, buildConfigContent(extraPlugins))
    await $(binaryPath, [
      inputPath,
      '--config',
      configPath,
      '--output',
      outputPath
    ])
  } finally {
    try { await unlink(configPath) } catch {}
  }
}

const svg = withMeta('svg', async ({ inputPath, outputPath, losy = false }) => {
  if (!losy) return run({ inputPath, outputPath, extraPlugins: EXTRA_COMMON_PLUGINS })

  const lossyPath = `${outputPath}.lossy.svg`
  try {
    await run({
      inputPath,
      outputPath: lossyPath,
      extraPlugins: EXTRA_AGGRESSIVE_PLUGINS
    })
    await run({
      inputPath: lossyPath,
      outputPath,
      extraPlugins: EXTRA_COMMON_PLUGINS
    })
  } finally {
    try { await unlink(lossyPath) } catch {}
  }
})

module.exports = { binaryPath, svg }
