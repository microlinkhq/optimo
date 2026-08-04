'use strict'

// optimo shells out to a system `magick`. When one isn't installed — e.g. a CI
// runner or a serverless build image — provision a self-contained ImageMagick
// so image optimization still works out of the box.
//
// Best-effort by design: any failure (offline, unsupported platform, blocked
// download) is swallowed so it never breaks the host install. optimo simply
// skips image steps until a `magick` is available.
const { execFileSync } = require('node:child_process')

const provision = require('../src/util/provision-magick')

const hasSystemMagick = () => {
  try {
    execFileSync('which', ['magick'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

const main = async () => {
  if (hasSystemMagick()) return
  const binary = await provision()
  if (binary) console.log('optimo: provisioned a bundled ImageMagick')
}

main().catch(error => {
  console.warn(
    `optimo: could not provision ImageMagick (${error.message}); ` +
      'image optimization will be skipped until a system `magick` is available.'
  )
})
