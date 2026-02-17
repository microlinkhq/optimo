'use strict'

const path = require('node:path')
const { stat, rename, unlink } = require('node:fs/promises')
const { execFileSync } = require('node:child_process')

const $ = require('tinyspawn')
const resolveBinary = require('../util/resolve-binary')

const binaryPath = resolveBinary('magick')

const PNG_QUALITY_CANDIDATES = [91, 94, 95, 97]

const withMeta = (format, fn) => {
  const wrapped = async ctx => fn(ctx)
  wrapped.binaryName = 'magick'
  wrapped.binaryPath = binaryPath
  wrapped.format = format
  return wrapped
}

const MAGICK_JPEG_LOSSY_FLAGS = [
  '-strip',
  '-sampling-factor',
  '4:2:0',
  '-define',
  'jpeg:optimize-coding=true',
  '-define',
  'jpeg:dct-method=float',
  '-quality',
  '80',
  '-interlace',
  'Plane'
]

const MAGICK_JPEG_LOSSLESS_FLAGS = [
  '-define',
  'jpeg:optimize-coding=true',
  '-interlace',
  'Plane'
]

const MAGICK_PNG_LOSSLESS_FLAGS = []
const MAGICK_PNG_LOSSY_FLAGS = [
  '-strip',
  '-define',
  'png:exclude-chunks=all',
  '-define',
  'png:include-chunks=tRNS,gAMA'
]

const MAGICK_GIF_FLAGS = ['-strip', '-coalesce', '-layers', 'OptimizePlus']

const MAGICK_WEBP_FLAGS = [
  '-strip',
  '-define',
  'webp:method=6',
  '-define',
  'webp:thread-level=1',
  '-quality',
  '80'
]

const MAGICK_AVIF_FLAGS = [
  '-strip',
  '-define',
  'heic:speed=1',
  '-quality',
  '50'
]

const MAGICK_HEIC_FLAGS = [
  '-strip',
  '-define',
  'heic:speed=1',
  '-quality',
  '75'
]

const MAGICK_JXL_FLAGS = ['-strip', '-define', 'jxl:effort=9', '-quality', '75']

const MAGICK_SVG_FLAGS = ['-strip']

const MAGICK_GENERIC_FLAGS = ['-strip']

const flagsByExt = ({ ext, aggressiveCompression = false }) => {
  if (ext === '.jpg' || ext === '.jpeg') {
    return aggressiveCompression ? MAGICK_JPEG_LOSSY_FLAGS : MAGICK_JPEG_LOSSLESS_FLAGS
  }
  if (ext === '.png') {
    return aggressiveCompression ? MAGICK_PNG_LOSSY_FLAGS : MAGICK_PNG_LOSSLESS_FLAGS
  }
  if (ext === '.gif') return MAGICK_GIF_FLAGS
  if (ext === '.webp') return MAGICK_WEBP_FLAGS
  if (ext === '.avif') return MAGICK_AVIF_FLAGS
  if (ext === '.heic' || ext === '.heif') return MAGICK_HEIC_FLAGS
  if (ext === '.jxl') return MAGICK_JXL_FLAGS
  if (ext === '.svg') return MAGICK_SVG_FLAGS
  return MAGICK_GENERIC_FLAGS
}

const isAnimatedPng = filePath => {
  try {
    const frames = execFileSync(
      binaryPath,
      ['identify', '-format', '%n', filePath],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    )
      .trim()
      .split(/\s+/)
      .map(value => Number.parseInt(value, 10))
      .find(value => Number.isFinite(value) && value > 0)

    return (frames || 1) > 1
  } catch {
    return false
  }
}

const writePng = async ({ inputPath, outputPath, flags, resizeGeometry }) => {
  const writeCandidates = isAnimatedPng(inputPath)
    ? [90]
    : PNG_QUALITY_CANDIDATES
  const candidatePaths = []
  let bestPath = null
  let bestSize = Number.POSITIVE_INFINITY

  try {
    for (const quality of writeCandidates) {
      const candidatePath = `${outputPath}.q${quality}.png`
      candidatePaths.push(candidatePath)

      const args = [
        inputPath,
        ...(resizeGeometry ? ['-resize', resizeGeometry] : []),
        ...flags,
        '-quality',
        String(quality),
        candidatePath
      ]

      await $(binaryPath, args)
      const size = (await stat(candidatePath)).size

      if (size < bestSize) {
        bestSize = size
        bestPath = candidatePath
      }
    }

    if (!bestPath) throw new Error('No PNG candidate was generated')

    await rename(bestPath, outputPath)
  } finally {
    for (const candidatePath of candidatePaths) {
      if (candidatePath === bestPath) continue
      try {
        await unlink(candidatePath)
      } catch (error) {
        if (error.code !== 'ENOENT') {
          // Ignore cleanup failures to avoid masking optimization results.
        }
      }
    }
  }
}

const runOnce = async ({
  inputPath,
  outputPath,
  resizeGeometry,
  aggressiveCompression = false
}) => {
  const ext = path.extname(outputPath).toLowerCase()
  const flags = flagsByExt({ ext, aggressiveCompression })

  if (ext === '.png') {
    await writePng({ inputPath, outputPath, flags, resizeGeometry })
    return
  }

  const args = [
    inputPath,
    ...(resizeGeometry ? ['-resize', resizeGeometry] : []),
    ...flags,
    outputPath
  ]

  await $(binaryPath, args)
}

const runMaxSize = async ({
  inputPath,
  outputPath,
  maxSize,
  aggressiveCompression = false
}) => {
  const resultByScale = new Map()

  const measureScale = async scale => {
    if (resultByScale.has(scale)) return resultByScale.get(scale)

    const candidatePath = `${outputPath}.scale${scale}${path.extname(
      outputPath
    )}`
    const resizeGeometry = scale === 100 ? null : `${scale}%`

    await runOnce({
      inputPath,
      outputPath: candidatePath,
      resizeGeometry,
      aggressiveCompression
    })

    const size = (await stat(candidatePath)).size
    resultByScale.set(scale, { size, candidatePath })
    return resultByScale.get(scale)
  }

  const full = await measureScale(100)
  if (full.size <= maxSize) {
    await rename(full.candidatePath, outputPath)
    return
  }

  const min = await measureScale(1)
  if (min.size > maxSize) {
    await rename(min.candidatePath, outputPath)
    return
  }

  let low = 1
  let high = 100
  let bestScale = 1

  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2)
    const { size } = await measureScale(mid)

    if (size <= maxSize) {
      low = mid
      bestScale = mid
    } else {
      high = mid
    }
  }

  const best = await measureScale(bestScale)
  await rename(best.candidatePath, outputPath)

  for (const [scale, value] of resultByScale.entries()) {
    if (scale === bestScale) continue
    try {
      await unlink(value.candidatePath)
    } catch (error) {
      if (error.code !== 'ENOENT') {
        // Ignore cleanup failures.
      }
    }
  }
}

const run = async ({
  inputPath,
  outputPath,
  resizeConfig,
  aggressiveCompression = false
}) => {
  if (resizeConfig?.mode === 'max-size') {
    await runMaxSize({
      inputPath,
      outputPath,
      maxSize: resizeConfig.value,
      aggressiveCompression
    })
    return
  }

  if (!aggressiveCompression) {
    await runOnce({
      inputPath,
      outputPath,
      resizeGeometry: resizeConfig?.value,
      aggressiveCompression: false
    })
    return
  }

  const lossyPath = `${outputPath}.lossy${path.extname(outputPath)}`
  try {
    await runOnce({
      inputPath,
      outputPath: lossyPath,
      resizeGeometry: resizeConfig?.value,
      aggressiveCompression: true
    })
    await runOnce({
      inputPath: lossyPath,
      outputPath,
      aggressiveCompression: false
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

const jpg = withMeta('jpg', run)
const jpeg = withMeta('jpeg', run)
const png = withMeta('png', run)
const gif = withMeta('gif', run)
const webp = withMeta('webp', run)
const avif = withMeta('avif', run)
const heic = withMeta('heic', run)
const heif = withMeta('heif', run)
const jxl = withMeta('jxl', run)
const svg = withMeta('svg', run)
const file = withMeta('file', run)

module.exports = {
  binaryPath,
  jpg,
  jpeg,
  png,
  gif,
  webp,
  avif,
  heic,
  heif,
  jxl,
  svg,
  file
}
