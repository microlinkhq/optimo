'use strict'

const path = require('path')

const normalizeFormat = require('./normalize-format')

module.exports = (filePath, format) => {
  const normalizedFormat = normalizeFormat(format)
  if (!normalizedFormat) return filePath
  const parsed = path.parse(filePath)
  return path.join(parsed.dir, `${parsed.name}.${normalizedFormat}`)
}
