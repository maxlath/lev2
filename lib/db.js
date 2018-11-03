/*
 *
 * db.js
 * create an instance of levelup.
 *
 */
const level = require('level-party')

module.exports = function (args) {
  // Ignore args that aren't meant to be database options
  // Start by cloning the args object so that those changes
  // don't propagate anyware else
  const dbArgs = JSON.parse(JSON.stringify(args))
  delete dbArgs.limit

  return level(dbArgs.path, dbArgs)
}
