'use strict'

const { execSync } = require('node:child_process')

const { vendored } = require('./vendor')

const systemBinary = binary => {
  try {
    return execSync(`which ${binary}`, {
      stdio: ['pipe', 'pipe', 'ignore']
    })
      .toString()
      .trim()
  } catch {
    return false
  }
}

module.exports = binary => systemBinary(binary) || vendored(binary)
module.exports.system = systemBinary
