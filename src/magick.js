'use strict'

const path = require('node:path')
const { execSync } = require('child_process')

const magickPath = (() => {
  try {
    return execSync('which magick', {
      stdio: ['pipe', 'pipe', 'ignore']
    })
      .toString()
      .trim()
  } catch {
    return false
  }
})()

/*
 * JPEG preset (compression-first):
 * - Favor smaller output via chroma subsampling and optimized Huffman coding.
 * - Progressive scan improves perceived loading on the web.
 */
const MAGICK_JPEG_FLAGS = [
  '-strip',
  '-sampling-factor',
  '4:2:0',
  '-define',
  'jpeg:optimize-coding=true',
  '-define',
  'jpeg:dct-method=float',
  '-quality',
  '80',
  '-interlace',
  'Plane'
]

/*
 * PNG preset (maximum deflate effort):
 * - Strip metadata payloads.
 * - Use highest compression level with explicit strategy/filter tuning.
 */
const MAGICK_PNG_FLAGS = [
  '-strip',
  '-define',
  'png:compression-level=9',
  '-define',
  'png:compression-strategy=1',
  '-define',
  'png:compression-filter=5'
]

/*
 * GIF preset (animation optimization):
 * - Coalesce frames before layer optimization to maximize delta compression.
 * - OptimizePlus is more aggressive for animated GIF size reduction.
 */
const MAGICK_GIF_FLAGS = ['-strip', '-coalesce', '-layers', 'OptimizePlus']

/*
 * WebP preset (compression-first):
 * - Use a strong encoder method and preserve compatibility with lossy output.
 */
const MAGICK_WEBP_FLAGS = [
  '-strip',
  '-define',
  'webp:method=6',
  '-define',
  'webp:thread-level=1',
  '-quality',
  '80'
]

/*
 * AVIF preset (compression-first):
 * - Slow encoder speed for stronger compression.
 */
const MAGICK_AVIF_FLAGS = [
  '-strip',
  '-define',
  'heic:speed=1',
  '-quality',
  '50'
]

/*
 * HEIC/HEIF preset (compression-first):
 * - Slow encoder speed for stronger compression.
 */
const MAGICK_HEIC_FLAGS = [
  '-strip',
  '-define',
  'heic:speed=1',
  '-quality',
  '75'
]

/*
 * JPEG XL preset (compression-first):
 * - Use max effort where supported.
 */
const MAGICK_JXL_FLAGS = ['-strip', '-define', 'jxl:effort=9', '-quality', '75']

/*
 * SVG preset:
 * - Keep optimization minimal to avoid destructive transformations.
 */
const MAGICK_SVG_FLAGS = ['-strip']

/*
 * Generic preset for any other format:
 * - Keep it broadly safe across decoders while still reducing size.
 */
const MAGICK_GENERIC_FLAGS = ['-strip']

const magickFlags = filePath => {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') return MAGICK_JPEG_FLAGS
  if (ext === '.png') return MAGICK_PNG_FLAGS
  if (ext === '.gif') return MAGICK_GIF_FLAGS
  if (ext === '.webp') return MAGICK_WEBP_FLAGS
  if (ext === '.avif') return MAGICK_AVIF_FLAGS
  if (ext === '.heic' || ext === '.heif') return MAGICK_HEIC_FLAGS
  if (ext === '.jxl') return MAGICK_JXL_FLAGS
  if (ext === '.svg') return MAGICK_SVG_FLAGS
  return MAGICK_GENERIC_FLAGS
}

module.exports = { magickPath, magickFlags }
