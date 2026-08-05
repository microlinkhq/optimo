'use strict'

const { mkdtemp, rm, stat } = require('node:fs/promises')
const { execFileSync } = require('node:child_process')
const test = require('ava').default
const os = require('node:os')
const path = require('node:path')

const resolveBinary = require('../src/util/resolve-binary')
const optimo = require('../src')

const binaryPath = resolveBinary('magick')
const it = binaryPath ? test : test.skip

let tmpdir

test.before(async () => {
  tmpdir = await mkdtemp(path.join(os.tmpdir(), 'optimo-png-'))
})

test.after.always(async () => {
  await rm(tmpdir, { recursive: true, force: true })
})

const createNoisyPng = ({ filePath, alpha }) => {
  execFileSync(binaryPath, [
    '-size',
    '400x400',
    'plasma:fractal',
    ...(alpha ? ['-alpha', 'set', '-channel', 'A', '-evaluate', 'set', '100%', '+channel'] : []),
    filePath
  ])
}

const identify = ({ filePath, format }) =>
  execFileSync(binaryPath, ['identify', '-format', format, filePath], { encoding: 'utf8' }).trim().split(/\s+/)[0]

it('drops a fully opaque alpha channel from a png', async t => {
  const withAlpha = path.join(tmpdir, 'opaque-alpha.png')

  createNoisyPng({ filePath: withAlpha, alpha: true })

  t.is(identify({ filePath: withAlpha, format: '%A' }), 'Blend')
  t.is(identify({ filePath: withAlpha, format: '%[opaque]' }), 'True')

  const result = await optimo.file(withAlpha)

  t.true(result.optimizedSize < result.originalSize)
  t.is(identify({ filePath: withAlpha, format: '%[channels]' }), 'srgb')
  t.is((await stat(withAlpha)).size, result.optimizedSize)
})

it('keeps the alpha channel when the png is actually transparent', async t => {
  const filePath = path.join(tmpdir, 'transparent.png')

  execFileSync(binaryPath, [
    '-size',
    '400x400',
    'plasma:fractal',
    '-alpha',
    'set',
    '-channel',
    'A',
    '-evaluate',
    'set',
    '50%',
    '+channel',
    filePath
  ])

  t.is(identify({ filePath, format: '%[opaque]' }), 'False')

  await optimo.file(filePath)

  t.is(identify({ filePath, format: '%[channels]' }), 'srgba')
})
