'use strict'

const { existsSync } = require('node:fs')
const path = require('node:path')

const VENDOR_DIR = path.join(__dirname, '..', '..', 'vendor')

const ENTRYPOINTS = {
  magick: path.join(VENDOR_DIR, 'imagemagick', 'AppRun')
}

const isSupported = () => process.platform === 'linux' && process.arch === 'x64'

const vendored = binary => {
  const entrypoint = ENTRYPOINTS[binary]
  return entrypoint !== undefined && existsSync(entrypoint) ? entrypoint : false
}

module.exports = { VENDOR_DIR, ENTRYPOINTS, isSupported, vendored }
