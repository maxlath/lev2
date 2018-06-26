/*
 *
 * print.js
 * A simple print utility.
 *
 */
var util = require('util')

module.exports = (err, val) => {
  var msg = (err && err.message) || val || 'OK'
  console.log(util.inspect(msg))
}
