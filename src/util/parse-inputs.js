'use strict'

const UNIT_TOKEN = /^[kmg]?b$/i
const NUMERIC = /^\d*\.?\d+$/

const parseInputs = (positionals = [], resize) => {
  const unitToken = positionals[1]

  const isSplitResize =
    resize !== undefined &&
    resize !== null &&
    NUMERIC.test(String(resize)) &&
    unitToken !== undefined &&
    UNIT_TOKEN.test(String(unitToken))

  return isSplitResize
    ? { inputs: [positionals[0], ...positionals.slice(2)], resize: `${resize}${unitToken}` }
    : { inputs: [...positionals], resize }
}

module.exports = parseInputs
