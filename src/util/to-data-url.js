'use strict'

const path = require('node:path')

const MIME_TYPES_BY_EXTENSION = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.jxl': 'image/jxl',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff'
}

const getMimeType = filePath => MIME_TYPES_BY_EXTENSION[path.extname(filePath).toLowerCase()] || 'application/octet-stream'

module.exports = ({ filePath, content }) => {
  const mimeType = getMimeType(filePath)
  return `data:${mimeType};base64,${content.toString('base64')}`
}
