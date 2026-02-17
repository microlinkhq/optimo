'use strict'

module.exports = (partial, total) =>
  (((partial - total) / total) * 100).toFixed(1)
