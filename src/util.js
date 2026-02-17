'use strict'

const { gray } = require('./colors')

const MAX_STATUS_LENGTH = 13 // Length of '[unsupported]'

const formatBytes = bytes => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatLog = (plainStatus, colorize, filePath) => {
  const padding = MAX_STATUS_LENGTH - plainStatus.length
  const paddedPlainStatus = plainStatus + ' '.repeat(Math.max(0, padding))
  return `${colorize(paddedPlainStatus)} ${gray(filePath)}`
}

const percentage = (partial, total) =>
  (((partial - total) / total) * 100).toFixed(1)

const normalizeFormat = format => {
  if (!format) return null
  const normalized = String(format).trim().toLowerCase().replace(/^\./, '')
  if (normalized === 'jpg') return 'jpeg'
  if (normalized === 'tif') return 'tiff'
  return normalized
}

const parseResize = resize => {
  if (resize === undefined || resize === null || resize === '') return null

  const raw = String(resize).trim()
  const normalized = raw.toLowerCase().replace(/\s+/g, '')

  const dimensionMatch =
    normalized.match(/^([wh])(\d+)$/) || normalized.match(/^(\d+)([wh])$/)
  if (dimensionMatch) {
    const [, first, second] = dimensionMatch
    const axis = first === 'w' || first === 'h' ? first : second
    const value = Number(first === axis ? second : first)

    if (!Number.isFinite(value) || value <= 0) {
      throw new TypeError(
        'Resize width/height must be greater than 0 (e.g. w960, 960w, h480, 480h)'
      )
    }

    return {
      mode: 'dimension',
      value: axis === 'w' ? `${value}x` : `x${value}`
    }
  }

  const maxSizeMatch = normalized.match(/^(\d*\.?\d+)(b|kb|mb|gb)$/)
  if (maxSizeMatch) {
    const units = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 }
    const value = Number(maxSizeMatch[1])
    if (!Number.isFinite(value) || value <= 0) {
      throw new TypeError(
        'Resize max size must be greater than 0 (e.g. 100kB, 2MB)'
      )
    }

    return {
      mode: 'max-size',
      value: Math.floor(value * units[maxSizeMatch[2]])
    }
  }

  const percentage = raw.replace(/%$/, '')
  const value = Number(percentage)

  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(
      'Resize must be a percentage (50%), max size (100kB), width (w960/960w), or height (h480/480h)'
    )
  }

  return {
    mode: 'percentage',
    value: `${value}%`
  }
}

module.exports = {
  formatBytes,
  formatLog,
  normalizeFormat,
  parseResize,
  percentage
}
