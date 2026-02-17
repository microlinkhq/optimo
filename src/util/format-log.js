'use strict'

const { gray } = require('./colors')

const MAX_STATUS_LENGTH = 13 // Length of '[unsupported]'

module.exports = (plainStatus, colorize, filePath) => {
  const padding = MAX_STATUS_LENGTH - plainStatus.length
  const paddedPlainStatus = plainStatus + ' '.repeat(Math.max(0, padding))
  return `${colorize(paddedPlainStatus)} ${gray(filePath)}`
}
