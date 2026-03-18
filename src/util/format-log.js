'use strict'

const { gray } = require('./colors')

const MAX_STATUS_LENGTH = 13 // Length of '[unsupported]'

module.exports = (plainStatus, colorize, filePath) => {
  const padding = ' '.repeat(Math.max(0, MAX_STATUS_LENGTH - plainStatus.length))
  return `${padding}${colorize(plainStatus)} ${gray(filePath)}`
}
