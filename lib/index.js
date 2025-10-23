import { cli } from './cli.js'
import { getDB } from './db.js'
import { locate } from './location.js'
import { cliCommands } from './options.js'

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

  console.error(`Expected command arguments

The REPL feature was unmaintained and has thus been removed in v8.0.0

Use --help to get usage instructions.`)
  process.exit(1)
}
