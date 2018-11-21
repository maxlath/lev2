// Create an instance of levelup

const level = require('level-party')

module.exports = function (args) {
  // Ignore args that aren't meant to be database options
  // Start by cloning the args object so that those changes
  // don't propagate anyware else
  const dbArgs = JSON.parse(JSON.stringify(args))
  delete dbArgs.limit

  const db = level(dbArgs.path, dbArgs)
  checkAvailability(db)
  return db
}

const checkAvailability = db => {
  const check = () => {
    if (db._status === 'open') return
    console.error('fail to access database')
    console.error('possibly because another system user is already connected')
    console.error('see https://github.com/substack/level-party/issues/13')
    process.exit(1)
  }

  // If after 5 seconds, the first entry couldn't be read, exit with code 1
  setTimeout(check, 5000)
}
