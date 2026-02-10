'use strict'

const { stat, unlink, rename, readdir } = require('node:fs/promises')
const { execSync } = require('child_process')
const path = require('node:path')
const $ = require('tinyspawn')

const { formatLog, formatBytes } = require('./util')
const { yellow, gray, green } = require('./colors')

const MAGICK_JPEG_FLAGS = [
  '-strip',
  '-quality',
  '85',
  '-interlace',
  'Plane',
  '-sampling-factor',
  '4:2:0'
]

const MAGICK_PNG_FLAGS = [
  '-strip',
  '-define',
  'png:compression-level=9',
  '-define',
  'png:compression-strategy=1'
]

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

const file = async (filePath, { onLogs = () => {}, dryRun } = {}) => {
  if (!magickPath) {
    throw new Error('ImageMagick is not installed')
  }

  const ext = path.extname(filePath).toLowerCase()

  let flags
  if (ext === '.jpg' || ext === '.jpeg') {
    flags = MAGICK_JPEG_FLAGS
  } else if (ext === '.png') {
    flags = MAGICK_PNG_FLAGS
  } else {
    onLogs(formatLog('[unsupported]', yellow, filePath))
    return { originalSize: 0, optimizedSize: 0 }
  }

  const optimizedPath = `${filePath}.optimized`

  const [originalSize] = await Promise.all([
    (await stat(filePath)).size,
    await $('magick', [filePath, ...flags, optimizedPath])
  ])

  const optimizedSize = (await stat(optimizedPath)).size

  if (optimizedSize >= originalSize) {
    await unlink(optimizedPath)
    onLogs(formatLog('[0.0%]', gray, filePath))
    return { originalSize, optimizedSize: originalSize }
  }

  if (dryRun) {
    await unlink(optimizedPath)
  } else {
    await unlink(filePath)
    await rename(optimizedPath, filePath)
  }

  onLogs(formatLog(`[${percentage(optimizedSize, originalSize)}%]`, green, filePath))

  return { originalSize, optimizedSize }
}

const folder = async (folderPath, opts) => {
  const items = await readdir(folderPath, { withFileTypes: true })
  let totalOriginalSize = 0
  let totalOptimizedSize = 0

  for (const item of items) {
    const itemPath = path.join(folderPath, item.name)

    if (item.isDirectory()) {
      const subResult = await folder(itemPath, opts)
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
module.exports.folder = folder
module.exports.formatBytes = formatBytes
