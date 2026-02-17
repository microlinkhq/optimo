'use strict'

module.exports = format => {
  if (!format) return null
  const normalized = String(format).trim().toLowerCase().replace(/^\./, '')
  if (normalized === 'jpg') return 'jpeg'
  if (normalized === 'tif') return 'tiff'
  return normalized
}
