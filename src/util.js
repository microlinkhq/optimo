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

module.exports = {
  formatBytes,
  formatLog
}
