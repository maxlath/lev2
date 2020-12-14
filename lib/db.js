// Create an instance of levelup

const level = require('level-party')

module.exports = function (args, dbParams) {
  // Ignore args that aren't meant to be database options
  // Start by cloning the args object so that those changes
  // don't propagate anyware else
  const dbArgs = JSON.parse(JSON.stringify(args))
  delete dbArgs.limit

  const db = level(dbArgs.path, dbArgs)
  checkAvailability(db, dbParams)
  return db
}

const checkAvailability = (db, dbParams = {}) => {
  if (dbParams.dbFreshlyCreated) return

  let available = false

  // Try to access the first entry in the database
  db.createKeyStream({ limit: 1 })
  .on('data', data => { available = true })

  const check = () => {
    if (available) return
    console.error('Failed to access the database. Possibly reasons:')
    console.error('- the database is empty')
    console.error('- another process not using level-party is currently locking the database')
    console.error('- another system user is already connected (see https://github.com/substack/level-party/issues/13 )')
    process.exit(1)
  }

  if (process._cliMode) {
    // If after 5 seconds, the first entry couldn't be read, exit with code 1
    setTimeout(check, 5000)
  }
}
