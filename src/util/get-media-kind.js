'use strict'

const path = require('node:path')

const VIDEO_EXTENSIONS = new Set([
  '.mp4',
  '.m4v',
  '.mov',
  '.webm',
  '.mkv',
  '.avi',
  '.ogv'
])

module.exports = filePath => {
  const ext = path.extname(filePath).toLowerCase()
  return VIDEO_EXTENSIONS.has(ext) ? 'video' : 'image'
}
