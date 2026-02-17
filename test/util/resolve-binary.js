'use strict'

const test = require('ava')
const resolveBinary = require('../../src/util/resolve-binary')

test('resolveBinary resolves an existing binary and returns false for missing ones', t => {
  t.truthy(resolveBinary('node'))
  t.false(resolveBinary('__definitely_missing_binary__'))
})
