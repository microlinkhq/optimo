'use strict'

module.exports = binaries => {
  return binaries.filter(binary => !binary.binaryPath)
}
