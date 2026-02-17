'use strict'

module.exports = binaries => {
  const missing = binaries.filter(binary => !binary.binaryPath)
  if (missing.length !== 0) {
    throw new Error(
      `Missing required binaries: ${missing
        .map(binary => binary.name)
        .join(', ')}`
    )
  }
}
