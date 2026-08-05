'use strict'

const { mkdtemp, rm, writeFile, readFile } = require('node:fs/promises')
const test = require('ava').default
const os = require('node:os')
const path = require('node:path')

const resolveBinary = require('../src/util/resolve-binary')
const optimo = require('../src')

const it = resolveBinary('svgo') ? test : test.skip

let tmpdir

test.before(async () => {
  tmpdir = await mkdtemp(path.join(os.tmpdir(), 'optimo-svg-'))
})

test.after.always(async () => {
  await rm(tmpdir, { recursive: true, force: true })
})

it('collapses whitespace inside title and desc', async t => {
  const filePath = path.join(tmpdir, 'metadata.svg')

  await writeFile(
    filePath,
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><title>Adobe: document\n  management   solutions</title><desc>a\n\nb</desc><path d="M0 0h10v10H0z"/></svg>'
  )

  const result = await optimo.file(filePath)
  const output = await readFile(filePath, 'utf8')

  t.true(result.optimizedSize < result.originalSize)
  t.true(output.includes('<title>Adobe: document management solutions</title>'))
  t.true(output.includes('<desc>a b</desc>'))
})

it('leaves whitespace inside text elements untouched', async t => {
  const filePath = path.join(tmpdir, 'text.svg')

  await writeFile(
    filePath,
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><text x="0" y="5" xml:space="preserve">a   b</text></svg>'
  )

  await optimo.file(filePath)
  const output = await readFile(filePath, 'utf8')

  t.true(output.includes('a   b'))
})
