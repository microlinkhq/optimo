'use strict'

const test = require('ava')
const optimo = require('../src')

test('file throws when dataUrl is requested for video output', async t => {
  const error = await t.throwsAsync(
    optimo.file('/tmp/video.mp4', {
      dataUrl: true
    })
  )

  t.is(error.message, 'Data URL output is only supported for images.')
})

test('dir throws when dataUrl is requested', async t => {
  const error = await t.throwsAsync(
    optimo.dir('/tmp', {
      dataUrl: true
    })
  )

  t.is(error.message, 'Data URL output is only supported when optimizing a single image file.')
})
