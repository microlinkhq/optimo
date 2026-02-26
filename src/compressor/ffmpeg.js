'use strict'

const path = require('node:path')
const $ = require('tinyspawn')

const resolveBinary = require('../util/resolve-binary')

const binaryPath = resolveBinary('ffmpeg')

const withMeta = (format, fn) => {
  const wrapped = async ctx => fn(ctx)
  wrapped.binaryName = 'ffmpeg'
  wrapped.binaryPath = binaryPath
  wrapped.format = format
  return wrapped
}

/**
 * Translate optimo resize config to a FFmpeg `scale` filter.
 *
 * Output dimensions are normalized to even numbers because some codecs
 * (notably H.264) require even width/height to encode correctly.
 *
 * @param {{ mode: string, value: string | number } | null} resizeConfig
 * @returns {string | null}
 */
const getScaleFilter = resizeConfig => {
  if (!resizeConfig) return null

  if (resizeConfig.mode === 'max-size') {
    throw new TypeError(
      'Resize max size (e.g. 100kB) is image-only. For videos use percentage (50%), width (w960), or height (h480).'
    )
  }

  if (resizeConfig.mode === 'percentage') {
    const percentage = Number.parseFloat(resizeConfig.value.replace('%', ''))
    const ratio = percentage / 100
    return `scale=trunc(iw*${ratio}/2)*2:trunc(ih*${ratio}/2)*2`
  }

  if (resizeConfig.mode === 'dimension') {
    if (resizeConfig.value.endsWith('x')) {
      const width = Number.parseInt(resizeConfig.value.slice(0, -1), 10)
      return `scale=${width}:-2:force_original_aspect_ratio=decrease`
    }

    const height = Number.parseInt(resizeConfig.value.slice(1), 10)
    return `scale=-2:${height}:force_original_aspect_ratio=decrease`
  }

  return null
}

/**
 * Build FFmpeg codec/muxing flags based on output extension.
 *
 * Flag glossary used below:
 * - `-c:v <codec>`: video codec implementation.
 * - `-crf <n>`: quality target for constant-quality encoders; higher = smaller/worse quality.
 * - `-b:v 0`: disable target bitrate so CRF drives quality (VP9 mode).
 * - `-preset <name>`: encoder speed/compression tradeoff.
 * - `-tile-columns` / `-row-mt`: VP9 parallelism settings with better compression throughput.
 * - `-frame-parallel 1`: improves VP9 decode compatibility for web playback.
 * - `-pix_fmt yuv420p`: broadly compatible pixel format for playback.
 * - `-c:a <codec>` and `-b:a <rate>` / `-q:a <n>`: audio codec and quality.
 * - `-an`: drop audio entirely from output.
 * - `-movflags +faststart`: move MP4 metadata (moov atom) to file start for faster streaming start.
 *
 * `losy=true` intentionally picks more aggressive values for smaller files.
 *
 * @param {{ ext: string, losy?: boolean, mute?: boolean }} params
 * @returns {string[]}
 */
const getCodecArgsByExt = ({ ext, losy = false, mute = true }) => {
  if (ext === '.webm') {
    return [
      '-c:v',
      'libvpx-vp9',
      '-b:v',
      '0',
      '-crf',
      losy ? '35' : '31',
      '-row-mt',
      '1',
      '-tile-columns',
      '2',
      '-frame-parallel',
      '1',
      '-deadline',
      'good',
      '-cpu-used',
      losy ? '2' : '1',
      '-pix_fmt',
      'yuv420p',
      ...(mute ? [] : ['-c:a', 'libopus', '-b:a', losy ? '64k' : '96k'])
    ]
  }

  if (ext === '.ogv') {
    return [
      '-c:v',
      'libtheora',
      '-q:v',
      losy ? '4' : '6',
      ...(mute ? [] : ['-c:a', 'libvorbis', '-q:a', losy ? '3' : '4'])
    ]
  }

  return [
    '-c:v',
    'libx264',
    '-preset',
    losy ? 'medium' : 'slow',
    '-crf',
    losy ? '28' : '23',
    '-pix_fmt',
    'yuv420p',
    ...(mute ? [] : ['-c:a', 'aac', '-b:a', losy ? '96k' : '128k']),
    ...(ext === '.mp4' || ext === '.m4v' || ext === '.mov'
      ? ['-movflags', '+faststart']
      : [])
  ]
}

/**
 * Encode a video file with conservative defaults:
 * - strips metadata (`-map_metadata -1`)
 * - strips chapters/subtitles/data streams for smaller web outputs
 * - keeps the primary video stream and optional first audio stream (`0:a:0?`)
 * - applies a resize filter when requested
 *
 * @param {{
 *  inputPath: string,
 *  outputPath: string,
 *  resizeConfig?: { mode: string, value: string | number } | null,
 *  losy?: boolean,
 *  mute?: boolean
 * }} params
 */
const run = async ({ inputPath, outputPath, resizeConfig, losy = false, mute = true }) => {
  const ext = path.extname(outputPath).toLowerCase()
  const scaleFilter = getScaleFilter(resizeConfig)
  const codecArgs = getCodecArgsByExt({ ext, losy, mute })

  await $(binaryPath, [
    '-v',
    'error',
    '-y',
    '-i',
    inputPath,
    ...(scaleFilter ? ['-vf', scaleFilter] : []),
    '-map_metadata',
    '-1',
    '-map_chapters',
    '-1',
    '-dn',
    '-sn',
    '-map',
    '0:v:0',
    ...(mute ? ['-an'] : ['-map', '0:a:0?']),
    ...codecArgs,
    outputPath
  ])
}

const mp4 = withMeta('mp4', run)
const m4v = withMeta('m4v', run)
const mov = withMeta('mov', run)
const webm = withMeta('webm', run)
const mkv = withMeta('mkv', run)
const avi = withMeta('avi', run)
const ogv = withMeta('ogv', run)
const file = withMeta('file', run)

module.exports = {
  binaryPath,
  mp4,
  m4v,
  mov,
  webm,
  mkv,
  avi,
  ogv,
  file
}
