'use strict'

const { execSync } = require('node:child_process')

const { vendoredMagick } = require('./vendor')

module.exports = binary => {
  try {
    return execSync(`which ${binary}`, {
      stdio: ['pipe', 'pipe', 'ignore']
    })
      .toString()
      .trim()
  } catch {
    // No system binary: fall back to a self-provisioned one when we ship it.
    if (binary === 'magick') return vendoredMagick()
    return false
  }
}
