// Tries to find the location of the database.

module.exports = function (argv, cb) {
  var location = typeof argv.location === 'string'
  argv.path = (location && argv.location) || argv._[0] || process.cwd()

  if (isDatabasePath(argv.path)) cb()
  else requestConfirmation(argv.path, cb)

  if (!argv.path) {
    if (isDatabasePath(process.cwd())) {
      argv.path = process.cwd()
    } else {
      console.error('no database found')
      return process.exit(1)
    }
  }
}

function isDatabasePath (path) {
  try {
    var testFilePath = require('path').resolve(path) + '/CURRENT'
    var CURRENT = require('fs').readFileSync(testFilePath).toString()
    return CURRENT.split('-')[0] === 'MANIFEST'
  } catch (err) {
    if (err.code === 'ENOENT') return false
    throw err
  }
}

function requestConfirmation (path, cb) {
  process.stdout.write(`do you really want to create a new database in ${path}? [y/N] `, err => {
    process.stdin.once('data', data => {
      if (err) return cb(err)
      if (data.toString().trim().toLowerCase() === 'y') cb()
      else process.exit(1)
    })
  })
}
