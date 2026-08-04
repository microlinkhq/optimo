'use strict'

const { mkdir, writeFile, rm } = require('node:fs/promises')
const test = require('ava').default
const { existsSync } = require('node:fs')
const path = require('node:path')

const { ENTRYPOINTS, vendored } = require('../../src/util/vendor')

test('vendored returns false for a binary that is never provisioned', t => {
  t.false(vendored('ffmpeg'))
})

test('vendored returns the entrypoint once it exists on disk', async t => {
  if (existsSync(ENTRYPOINTS.magick)) return t.is(vendored('magick'), ENTRYPOINTS.magick)

  const dir = path.dirname(ENTRYPOINTS.magick)
  await mkdir(dir, { recursive: true })
  await writeFile(ENTRYPOINTS.magick, '')
  t.teardown(() => rm(dir, { recursive: true, force: true }))

  t.is(vendored('magick'), ENTRYPOINTS.magick)
})
