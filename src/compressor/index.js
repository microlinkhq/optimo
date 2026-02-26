'use strict'

const path = require('node:path')

const mozjpegtran = require('./mozjpegtran')
const gifsicle = require('./gifsicle')
const magick = require('./magick')
const ffmpeg = require('./ffmpeg')
const svgo = require('./svgo')

const PIPELINES = {
  '.png': [magick.png],
  '.svg': [svgo.svg],
  '.jpg': [magick.jpg, mozjpegtran.jpg],
  '.jpeg': [magick.jpeg, mozjpegtran.jpeg],
  '.gif': [magick.gif, gifsicle.gif],
  '.webp': [magick.webp],
  '.avif': [magick.avif],
  '.heic': [magick.heic],
  '.heif': [magick.heif],
  '.jxl': [magick.jxl],
  '.mp4': [ffmpeg.mp4],
  '.m4v': [ffmpeg.m4v],
  '.mov': [ffmpeg.mov],
  '.webm': [ffmpeg.webm],
  '.mkv': [ffmpeg.mkv],
  '.avi': [ffmpeg.avi],
  '.ogv': [ffmpeg.ogv]
}

const getPipeline = filePath => {
  const ext = path.extname(filePath).toLowerCase()
  return PIPELINES[ext] || [magick.file]
}

const getRequiredBinaries = (pipeline, opts = {}) => {
  const binaries = []

  for (const step of pipeline.filter(Boolean)) {
    if (typeof step.getRequiredBinaries === 'function') {
      binaries.push(...step.getRequiredBinaries(opts))
      continue
    }

    binaries.push({
      name: step.binaryName,
      binaryPath: step.binaryPath || false
    })
  }

  return Array.from(new Map(binaries.map(binary => [binary.name, binary])).values())
}

module.exports = { getPipeline, getRequiredBinaries }
