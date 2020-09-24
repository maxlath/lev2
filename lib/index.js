const completion = require('./completion')
const history = require('./history')
const createREPL = require('./repl')
const getDB = require('./db')
const locate = require('./location')
const cache = require('./cache')
const cli = require('./cli')
const { cliCommands } = require('./options')

module.exports = function (args) {
  // Find where the location by examining the arguments
  // and create an instance to work with.
  locate(args, (err, dbParams) => {
    if (err) {
      console.error(err)
      return process.exit(1)
    }
    init(args, dbParams)
  })
}

function init (args, dbParams) {
  const db = getDB(args, dbParams)

  const cliMode = Object.keys(args)
    .some(cmd => cliCommands.includes(cmd))

  process._cliMode = cliMode

  if (cliMode) return cli(db, args)

  if (!process.stdout.isTTY) {
    console.error('REPL can only be started in a TTY')
    process.exit(1)
  }

  // Create the instance of the repl and start it.
  const repl = createREPL(db, args, cache)

  history(repl, args)
  completion(repl, cache)
}
