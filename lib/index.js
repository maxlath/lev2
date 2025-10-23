import cache from './cache.js'
import cli from './cli.js'
import completion from './completion.js'
import getDB from './db.js'
import history from './history.js'
import { locate } from './location.js'
import { cliCommands } from './options.js'
import { createREPL } from './repl.js'

export default function (args) {
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
