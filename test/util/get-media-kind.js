'use strict'

const test = require('ava')

const getMediaKind = require('../../src/util/get-media-kind')

test('getMediaKind detects known video extensions', t => {
  t.is(getMediaKind('/tmp/video.mp4'), 'video')
  t.is(getMediaKind('/tmp/video.MOV'), 'video')
  t.is(getMediaKind('/tmp/video.webm'), 'video')
})

test('getMediaKind defaults to image for non-video paths', t => {
  t.is(getMediaKind('/tmp/image.jpg'), 'image')
  t.is(getMediaKind('/tmp/image.png'), 'image')
  t.is(getMediaKind('/tmp/file.unknown'), 'image')
})
