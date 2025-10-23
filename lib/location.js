// Tries to find the location of the database.
import fs from 'node:fs'
import { resolve } from 'node:path'

export function locate (argv, cb) {
  const location = typeof argv.location === 'string'
  argv.path = (location && argv.location) || argv._[0] || process.cwd()

  if (isDatabasePath(argv.path)) cb()
  else if (argv.create) cb(null, { dbFreshlyCreated: true })
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
  const testFilePath = resolve(path) + '/LOG'
  return fs.existsSync(testFilePath)
}

function requestConfirmation (path, cb) {
  process.stdout.write(`do you really want to create a new database in ${path}? [y/N] `, err => {
    process.stdin.once('data', data => {
      if (err) return cb(err)
      if (data.toString().trim().toLowerCase() === 'y') cb(null, { dbFreshlyCreated: true })
      else process.exit(1)
    })
  })
}
