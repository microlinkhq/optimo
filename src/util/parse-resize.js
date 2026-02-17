'use strict'

module.exports = resize => {
  if (resize === undefined || resize === null || resize === '') return null

  const raw = String(resize).trim()
  const normalized = raw.toLowerCase().replace(/\s+/g, '')

  const dimensionMatch =
    normalized.match(/^([wh])(\d+)$/) || normalized.match(/^(\d+)([wh])$/)
  if (dimensionMatch) {
    const [, first, second] = dimensionMatch
    const axis = first === 'w' || first === 'h' ? first : second
    const value = Number(first === axis ? second : first)

    if (!Number.isFinite(value) || value <= 0) {
      throw new TypeError(
        'Resize width/height must be greater than 0 (e.g. w960, 960w, h480, 480h)'
      )
    }

    return {
      mode: 'dimension',
      value: axis === 'w' ? `${value}x` : `x${value}`
    }
  }

  const maxSizeMatch = normalized.match(/^(\d*\.?\d+)(b|kb|mb|gb)$/)
  if (maxSizeMatch) {
    const units = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 }
    const value = Number(maxSizeMatch[1])
    if (!Number.isFinite(value) || value <= 0) {
      throw new TypeError(
        'Resize max size must be greater than 0 (e.g. 100kB, 2MB)'
      )
    }

    return {
      mode: 'max-size',
      value: Math.floor(value * units[maxSizeMatch[2]])
    }
  }

  const percentage = raw.replace(/%$/, '')
  const value = Number(percentage)

  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(
      'Resize must be a percentage (50%), max size (100kB), width (w960/960w), or height (h480/480h)'
    )
  }

  return {
    mode: 'percentage',
    value: `${value}%`
  }
}
