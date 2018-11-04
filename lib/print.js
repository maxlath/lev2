/*
 *
 * print.js
 * A simple print utility.
 *
 */
var util = require('util')

module.exports = (err, val) => {
  var output = (err && err.message) || val || 'OK'
  if (typeof output === 'object') output = JSON.stringify(output)
  console.log(output)
}
