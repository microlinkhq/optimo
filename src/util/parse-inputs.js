'use strict'

const UNIT_TOKEN = /^[kmg]?b$/i
const NUMERIC = /^\d*\.?\d+$/

const parseInputs = (positionals = [], resize) => {
  const [first, unitToken, ...rest] = positionals

  return NUMERIC.test(String(resize)) && UNIT_TOKEN.test(String(unitToken))
    ? { inputs: [first, ...rest], resize: `${resize}${unitToken}` }
    : { inputs: positionals, resize }
}

module.exports = parseInputs
