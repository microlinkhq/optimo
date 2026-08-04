'use strict'

const { mkdir, rm, rename, writeFile } = require('node:fs/promises')
const { execFileSync } = require('node:child_process')
const { existsSync } = require('node:fs')
const { hash } = require('node:crypto')
const path = require('node:path')

const { VENDOR_DIR, ENTRYPOINTS, isSupported } = require('./vendor')

// Update url and sha256 together; the download is rejected on a mismatch.
const RELEASE = {
  url: 'https://github.com/ImageMagick/ImageMagick/releases/download/7.1.2-26/ImageMagick-7.1.2-26-gcc-x86_64.AppImage',
  sha256: '6366d353b81871929a653ad81158e805f3611d1be7836f2490b6afc38b64c92f'
}

module.exports = async () => {
  if (!isSupported()) return false
  if (existsSync(ENTRYPOINTS.magick)) return ENTRYPOINTS.magick

  const response = await fetch(RELEASE.url)
  if (!response.ok) throw new Error(`unexpected status ${response.status} for ${RELEASE.url}`)

  const payload = Buffer.from(await response.arrayBuffer())
  const digest = hash('sha256', payload, 'hex')
  if (digest !== RELEASE.sha256) {
    throw new Error(`checksum mismatch (expected ${RELEASE.sha256}, got ${digest})`)
  }

  await mkdir(VENDOR_DIR, { recursive: true })
  const appImage = path.join(VENDOR_DIR, 'imagemagick.AppImage')
  await writeFile(appImage, payload, { mode: 0o755 })

  // `--appimage-extract` unpacks to ./squashfs-root without needing FUSE.
  await rm(path.join(VENDOR_DIR, 'squashfs-root'), { recursive: true, force: true })
  execFileSync(appImage, ['--appimage-extract'], { cwd: VENDOR_DIR, stdio: 'ignore' })
  await rm(appImage, { force: true })
  await rm(path.join(VENDOR_DIR, 'imagemagick'), { recursive: true, force: true })
  await rename(path.join(VENDOR_DIR, 'squashfs-root'), path.join(VENDOR_DIR, 'imagemagick'))

  return ENTRYPOINTS.magick
}
