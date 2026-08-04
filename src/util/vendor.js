'use strict'

const { existsSync } = require('node:fs')
const path = require('node:path')

// Where the postinstall step stores a self-provisioned ImageMagick. It lives
// inside the package so it ships with the install and is rebuilt on reinstall;
// it's intentionally absent from `files` so it's never published.
const VENDOR_DIR = path.join(__dirname, '..', '..', 'vendor')

// The Linux build is shipped as an AppImage; we extract it at install time and
// invoke its `AppRun`, which wires up the bundled libraries and delegates.
const magickPath = () => path.join(VENDOR_DIR, 'imagemagick', 'AppRun')

// Only linux-x64 has an official self-contained binary we can provision; every
// other platform falls back to a system `magick` (devs install it via brew,
// apt, choco…). This is also what gates the postinstall download.
const isSupported = () => process.platform === 'linux' && process.arch === 'x64'

// The provisioned binary, or false when it hasn't been provisioned.
const vendoredMagick = () => {
  const binary = magickPath()
  return existsSync(binary) ? binary : false
}

module.exports = { VENDOR_DIR, magickPath, isSupported, vendoredMagick }
