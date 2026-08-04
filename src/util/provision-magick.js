'use strict'

const { createReadStream, createWriteStream, existsSync } = require('node:fs')
const { mkdir, rm, rename, chmod } = require('node:fs/promises')
const { execFileSync } = require('node:child_process')
const { createHash } = require('node:crypto')
const path = require('node:path')
const https = require('node:https')

const { VENDOR_DIR, magickPath, isSupported } = require('./vendor')

// Pinned ImageMagick AppImage: a single self-contained file that bundles its
// own libraries and delegates, so it runs on a bare build image. Update the
// version and sha256 together — the checksum is verified before use.
const RELEASE = {
  url: 'https://github.com/ImageMagick/ImageMagick/releases/download/7.1.2-26/ImageMagick-7.1.2-26-gcc-x86_64.AppImage',
  sha256: '6366d353b81871929a653ad81158e805f3611d1be7836f2490b6afc38b64c92f'
}

const download = (url, dest) =>
  new Promise((resolve, reject) => {
    const get = current =>
      https
        .get(current, res => {
          const { statusCode, headers } = res
          if (statusCode >= 300 && statusCode < 400 && headers.location) {
            res.resume()
            return get(new URL(headers.location, current).toString())
          }
          if (statusCode !== 200) {
            res.resume()
            return reject(new Error(`unexpected status ${statusCode} for ${current}`))
          }
          const file = createWriteStream(dest)
          res.pipe(file)
          file.on('finish', () => file.close(resolve))
          file.on('error', reject)
        })
        .on('error', reject)
    get(url)
  })

const sha256 = filePath =>
  new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    createReadStream(filePath)
      .on('data', chunk => hash.update(chunk))
      .on('end', () => resolve(hash.digest('hex')))
      .on('error', reject)
  })

// Downloads, verifies and extracts the pinned ImageMagick into the vendor dir,
// returning the path to the runnable binary (or false on unsupported platforms).
// Idempotent: a previously provisioned binary is reused as-is.
module.exports = async () => {
  if (!isSupported()) return false
  if (existsSync(magickPath())) return magickPath()

  await mkdir(VENDOR_DIR, { recursive: true })
  const appImage = path.join(VENDOR_DIR, 'imagemagick.AppImage')

  await download(RELEASE.url, appImage)

  const digest = await sha256(appImage)
  if (digest !== RELEASE.sha256) {
    await rm(appImage, { force: true })
    throw new Error(`checksum mismatch (expected ${RELEASE.sha256}, got ${digest})`)
  }

  await chmod(appImage, 0o755)
  // `--appimage-extract` unpacks to ./squashfs-root without needing FUSE.
  await rm(path.join(VENDOR_DIR, 'squashfs-root'), { recursive: true, force: true })
  execFileSync(appImage, ['--appimage-extract'], { cwd: VENDOR_DIR, stdio: 'ignore' })
  await rm(appImage, { force: true })
  await rm(path.join(VENDOR_DIR, 'imagemagick'), { recursive: true, force: true })
  await rename(path.join(VENDOR_DIR, 'squashfs-root'), path.join(VENDOR_DIR, 'imagemagick'))

  return magickPath()
}
