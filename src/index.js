'use strict'

const { stat, unlink, rename, readdir } = require('node:fs/promises')

const path = require('node:path')
const $ = require('tinyspawn')

const { magickPath, magickFlags } = require('./magick')
const { yellow, gray, green } = require('./colors')

const {
  formatBytes,
  formatLog,
  normalizeFormat,
  parseResize,
  percentage
} = require('./util')

const getOutputPath = (filePath, format) => {
  const normalizedFormat = normalizeFormat(format)
  if (!normalizedFormat) return filePath
  const parsed = path.parse(filePath)
  return path.join(parsed.dir, `${parsed.name}.${normalizedFormat}`)
}

const runMagick = async ({
  filePath,
  optimizedPath,
  flags,
  resizePercentage = null
}) => {
  const magickArgs = [
    filePath,
    ...(resizePercentage ? ['-resize', resizePercentage] : []),
    ...flags,
    optimizedPath
  ]

  await $('magick', magickArgs)
  return (await stat(optimizedPath)).size
}

const optimizeForMaxSize = async ({
  filePath,
  optimizedPath,
  flags,
  maxSize
}) => {
  const resultByScale = new Map()

  const measureScale = async scale => {
    if (resultByScale.has(scale)) return resultByScale.get(scale)
    const resizePercentage = scale === 100 ? null : `${scale}%`
    const size = await runMagick({
      filePath,
      optimizedPath,
      flags,
      resizePercentage
    })
    resultByScale.set(scale, size)
    return size
  }

  const fullSize = await measureScale(100)
  if (fullSize <= maxSize) {
    return fullSize
  }

  const minScaleSize = await measureScale(1)
  if (minScaleSize > maxSize) {
    return minScaleSize
  }

  let low = 1
  let high = 100
  let bestScale = 1

  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2)
    const size = await measureScale(mid)

    if (size <= maxSize) {
      low = mid
      bestScale = mid
    } else {
      high = mid
    }
  }

  return resultByScale.get(bestScale)
}

const file = async (
  filePath,
  { onLogs = () => {}, dryRun, format: outputFormat, resize } = {}
) => {
  if (!magickPath) {
    throw new Error('ImageMagick is not installed')
  }
  const outputPath = getOutputPath(filePath, outputFormat)
  const resizeConfig = parseResize(resize)
  const flags = magickFlags(outputPath)

  const optimizedPath = `${outputPath}.optimized`
  const isConverting = outputPath !== filePath

  let originalSize
  let optimizedSize

  try {
    originalSize = (await stat(filePath)).size

    if (resizeConfig?.mode === 'max-size') {
      optimizedSize = await optimizeForMaxSize({
        filePath,
        optimizedPath,
        flags,
        maxSize: resizeConfig.value
      })
    } else {
      optimizedSize = await runMagick({
        filePath,
        optimizedPath,
        flags,
        resizePercentage: resizeConfig?.value
      })
    }
  } catch {
    onLogs(formatLog('[unsupported]', yellow, filePath))
    return { originalSize: 0, optimizedSize: 0 }
  }

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
