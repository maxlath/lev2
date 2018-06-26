const completion = require('./lib/completion')
const history = require('./lib/history')
const createREPL = require('./lib/repl')
const getDB = require('./lib/db')
const locate = require('./lib/location')
const cache = require('./lib/cache')
const cli = require('./lib/cli')

module.exports = function (args) {
  //
  // find where the location by examining the arguments
  // and create an instance to work with.
  //
  locate(args, err => {
    if (err) {
      console.error(err)
      return process.exit(1)
    }
    init(args)
  })
}

function init (args) {
  const db = getDB(args)

  //
  // if any of these commands are specified as arguments
  // than the program should not be run in REPL mode.
  //
  const cliCommands = [
    'keys', 'values', 'get', 'match', 'put', 'del',
    'all', 'batch', 'length', 'start', 'end', 'limit', 'map'
  ]

  const cliMode = Object.keys(args).some(cmd => {
    return cliCommands.indexOf(cmd) > -1
  })

  if (cliMode) return cli(db, args)

  //
  // create the instance of the repl and start it.
  //
  const repl = createREPL(db, args, cache)

  history(repl, args)
  completion(repl, cache)
}
