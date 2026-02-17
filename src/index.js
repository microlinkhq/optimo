'use strict'

const { stat, unlink, rename, readdir } = require('node:fs/promises')
const { execSync } = require('child_process')
const path = require('node:path')
const $ = require('tinyspawn')

const { formatLog, formatBytes } = require('./util')
const { yellow, gray, green } = require('./colors')

/*
 * JPEG preset (compression-first):
 * - Favor smaller output via chroma subsampling and optimized Huffman coding.
 * - Progressive scan improves perceived loading on the web.
 */
const MAGICK_JPEG_FLAGS = [
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

/*
 * PNG preset (maximum deflate effort):
 * - Strip metadata payloads.
 * - Use highest compression level with explicit strategy/filter tuning.
 */
const MAGICK_PNG_FLAGS = [
  '-strip',
  '-define',
  'png:compression-level=9',
  '-define',
  'png:compression-strategy=1',
  '-define',
  'png:compression-filter=5'
]

/*
 * GIF preset (animation optimization):
 * - Coalesce frames before layer optimization to maximize delta compression.
 * - OptimizePlus is more aggressive for animated GIF size reduction.
 */
const MAGICK_GIF_FLAGS = ['-strip', '-coalesce', '-layers', 'OptimizePlus']

/*
 * WebP preset (compression-first):
 * - Use a strong encoder method and preserve compatibility with lossy output.
 */
const MAGICK_WEBP_FLAGS = [
  '-strip',
  '-define',
  'webp:method=6',
  '-define',
  'webp:thread-level=1',
  '-quality',
  '80'
]

/*
 * AVIF preset (compression-first):
 * - Slow encoder speed for stronger compression.
 */
const MAGICK_AVIF_FLAGS = [
  '-strip',
  '-define',
  'heic:speed=1',
  '-quality',
  '50'
]

/*
 * HEIC/HEIF preset (compression-first):
 * - Slow encoder speed for stronger compression.
 */
const MAGICK_HEIC_FLAGS = [
  '-strip',
  '-define',
  'heic:speed=1',
  '-quality',
  '75'
]

/*
 * JPEG XL preset (compression-first):
 * - Use max effort where supported.
 */
const MAGICK_JXL_FLAGS = ['-strip', '-define', 'jxl:effort=9', '-quality', '75']

/*
 * SVG preset:
 * - Keep optimization minimal to avoid destructive transformations.
 */
const MAGICK_SVG_FLAGS = ['-strip']

/*
 * Generic preset for any other format:
 * - Keep it broadly safe across decoders while still reducing size.
 */
const MAGICK_GENERIC_FLAGS = ['-strip']

const magickPath = (() => {
  try {
    return execSync('which magick', {
      stdio: ['pipe', 'pipe', 'ignore']
    })
      .toString()
      .trim()
  } catch {
    return false
  }
})()

const percentage = (partial, total) =>
  (((partial - total) / total) * 100).toFixed(1)

const normalizeFormat = format => {
  if (!format) return null

  const normalized = String(format).trim().toLowerCase().replace(/^\./, '')
  if (normalized === 'jpg') return 'jpeg'
  if (normalized === 'tif') return 'tiff'

  return normalized
}

const getOutputPath = (filePath, format) => {
  const normalizedFormat = normalizeFormat(format)
  if (!normalizedFormat) return filePath

  const parsed = path.parse(filePath)
  return path.join(parsed.dir, `${parsed.name}.${normalizedFormat}`)
}

const getMagickFlags = filePath => {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') return MAGICK_JPEG_FLAGS
  if (ext === '.png') return MAGICK_PNG_FLAGS
  if (ext === '.gif') return MAGICK_GIF_FLAGS
  if (ext === '.webp') return MAGICK_WEBP_FLAGS
  if (ext === '.avif') return MAGICK_AVIF_FLAGS
  if (ext === '.heic' || ext === '.heif') return MAGICK_HEIC_FLAGS
  if (ext === '.jxl') return MAGICK_JXL_FLAGS
  if (ext === '.svg') return MAGICK_SVG_FLAGS
  return MAGICK_GENERIC_FLAGS
}

const parseResize = resize => {
  if (resize === undefined || resize === null || resize === '') return null

  const normalized = String(resize).trim().replace(/%$/, '')
  const value = Number(normalized)

  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(
      'Resize percentage must be a number greater than 0 (e.g. 50 or 50%)'
    )
  }

  return `${value}%`
}

const file = async (
  filePath,
  { onLogs = () => {}, dryRun, format: outputFormat, resize } = {}
) => {
  if (!magickPath) {
    throw new Error('ImageMagick is not installed')
  }
  const outputPath = getOutputPath(filePath, outputFormat)
  const resizePercentage = parseResize(resize)
  const flags = getMagickFlags(outputPath)

  const optimizedPath = `${outputPath}.optimized`
  const isConverting = outputPath !== filePath

  let originalSize
  try {
    const magickArgs = [
      filePath,
      ...(resizePercentage ? ['-resize', resizePercentage] : []),
      ...flags,
      optimizedPath
    ]

    ;[originalSize] = await Promise.all([
      (await stat(filePath)).size,
      await $('magick', magickArgs)
    ])
  } catch {
    onLogs(formatLog('[unsupported]', yellow, filePath))
    return { originalSize: 0, optimizedSize: 0 }
  }

  const optimizedSize = (await stat(optimizedPath)).size

  if (!isConverting && optimizedSize >= originalSize) {
    await unlink(optimizedPath)
    onLogs(formatLog('[optimized]', gray, filePath))
    return { originalSize, optimizedSize: originalSize }
  }

  if (dryRun) {
    await unlink(optimizedPath)
  } else {
    if (isConverting) {
      try {
        await unlink(outputPath)
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
    } else {
      await unlink(filePath)
    }

    await rename(optimizedPath, outputPath)

    if (isConverting) {
      await unlink(filePath)
    }
  }

  onLogs(
    formatLog(
      `[${percentage(optimizedSize, originalSize)}%]`,
      green,
      isConverting ? `${filePath} -> ${outputPath}` : filePath
    )
  )

  return { originalSize, optimizedSize }
}

const dir = async (folderPath, opts) => {
  const items = (await readdir(folderPath, { withFileTypes: true })).filter(
    item => !item.name.startsWith('.')
  )
  let totalOriginalSize = 0
  let totalOptimizedSize = 0

  for (const item of items) {
    const itemPath = path.join(folderPath, item.name)

    if (item.isDirectory()) {
      const subResult = await dir(itemPath, opts)
      totalOriginalSize += subResult.originalSize
      totalOptimizedSize += subResult.optimizedSize
    } else {
      const result = await file(itemPath, opts)
      totalOriginalSize += result.originalSize
      totalOptimizedSize += result.optimizedSize
    }
  }

  return {
    originalSize: totalOriginalSize,
    optimizedSize: totalOptimizedSize,
    savings: totalOriginalSize - totalOptimizedSize
  }
}

module.exports.file = file
module.exports.dir = dir
module.exports.formatBytes = formatBytes
