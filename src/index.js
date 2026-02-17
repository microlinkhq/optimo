'use strict'

const { stat, unlink, rename, readdir, copyFile } = require('node:fs/promises')
const path = require('node:path')

const { getPipeline, getRequiredBinaries } = require('./compressor')
const ensureBinaries = require('./util/ensure-binaries')
const { yellow, gray, green } = require('./util/colors')
const getOutputPath = require('./util/get-output-path')
const formatBytes = require('./util/format-bytes')
const parseResize = require('./util/parse-resize')
const percentage = require('./util/percentage')
const formatLog = require('./util/format-log')
const debug = require('./util/debug')

const runStepInPlaceIfSmaller = async ({ currentPath, extension, step }) => {
  const candidatePath = `${currentPath}.candidate${extension}`

  await step({
    inputPath: currentPath,
    outputPath: candidatePath,
    resizeConfig: null,
    losy: false
  })

  const [currentSize, candidateSize] = await Promise.all([
    stat(currentPath).then(value => value.size),
    stat(candidatePath).then(value => value.size)
  ])

  if (candidateSize < currentSize) {
    await unlink(currentPath)
    await rename(candidatePath, currentPath)
  } else {
    await unlink(candidatePath)
  }
}

const executePipeline = async ({ pipeline, filePath, optimizedPath, resizeConfig, losy }) => {
  const extension = path.extname(optimizedPath) || '.tmp'

  await pipeline[0]({
    inputPath: filePath,
    outputPath: optimizedPath,
    resizeConfig,
    losy
  })

  for (const step of pipeline.slice(1)) {
    await runStepInPlaceIfSmaller({
      currentPath: optimizedPath,
      extension,
      step: async args => step({ ...args, losy })
    })
  }

  return (await stat(optimizedPath)).size
}

const file = async (filePath, { onLogs = () => {}, dryRun, format: outputFormat, resize, losy = false } = {}) => {
  const outputPath = getOutputPath(filePath, outputFormat)
  const resizeConfig = parseResize(resize)
  const filePipeline = getPipeline(outputPath)
  const executionPipeline = [...filePipeline]

  const needsMagickForTransform = Boolean(resizeConfig) || outputPath !== filePath
  if (needsMagickForTransform && executionPipeline[0]?.binaryName !== 'magick') {
    const magick = require('./compressor/magick')
    const ext = path.extname(outputPath).toLowerCase().replace(/^\./, '')
    const magickStep = magick[ext] || magick.file
    executionPipeline.unshift(magickStep)
  }

  ensureBinaries(
    getRequiredBinaries(executionPipeline, {
      losy
    })
  )

  const optimizedPath = `${outputPath}.optimized${path.extname(outputPath)}`
  const isConverting = outputPath !== filePath

  let originalSize
  let optimizedSize

  try {
    originalSize = (await stat(filePath)).size

    if (executionPipeline.length === 0) {
      await copyFile(filePath, optimizedPath)
      optimizedSize = (await stat(optimizedPath)).size
    } else {
      optimizedSize = await executePipeline({
        pipeline: executionPipeline,
        filePath,
        optimizedPath,
        resizeConfig,
        losy
      })
    }
  } catch (error) {
    try {
      await unlink(optimizedPath)
    } catch (cleanupError) {
      if (cleanupError.code !== 'ENOENT') {
        debug.warn('file=optimize stage=cleanup-error', {
          filePath: optimizedPath,
          message: cleanupError?.message || 'cleanup failed'
        })
      }
    }

    debug.error('file=optimize stage=error', {
      filePath,
      message: error?.message || 'unknown',
      code: error?.code || 'unknown',
      name: error?.name || 'Error'
    })
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
  const items = (await readdir(folderPath, { withFileTypes: true })).filter(item => !item.name.startsWith('.'))
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
