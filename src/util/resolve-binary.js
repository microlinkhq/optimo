'use strict'

const { execSync } = require('node:child_process')

module.exports = binary => {
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
