'use strict'

const test = require('ava')

const { getPipeline } = require('../../src/compressor')

test('getPipeline returns ffmpeg pipeline for video formats', t => {
  const mp4Pipeline = getPipeline('/tmp/video.mp4')
  t.is(mp4Pipeline.length, 1)
  t.is(mp4Pipeline[0].binaryName, 'ffmpeg')
  t.is(mp4Pipeline[0].format, 'mp4')

  const webmPipeline = getPipeline('/tmp/video.webm')
  t.is(webmPipeline.length, 1)
  t.is(webmPipeline[0].binaryName, 'ffmpeg')
  t.is(webmPipeline[0].format, 'webm')
})
