'use strict'

const resolveBinary = require('../src/util/resolve-binary')

const main = async () => {
  if (resolveBinary.system('magick')) return
  const provision = require('../src/util/provision-magick')
  if (await provision()) console.log('optimo: provisioned a bundled ImageMagick')
}

// Never break the host install: an offline, unsupported or blocked provision
// just means optimo skips image steps until a system `magick` shows up.
main().catch(error => {
  console.warn(
    `optimo: could not provision ImageMagick (${error.message}); ` +
      'image optimization will be skipped until a system `magick` is available.'
  )
})
