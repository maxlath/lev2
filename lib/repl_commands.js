const print = require('./print')
const Tabulate = require('tabulate')

module.exports = (repl, db, config, cache) => ({
  ls: opts => {
    opts = Object.assign(config.query, opts)
    const tabulate = Tabulate(process.stdout)
    cache.invalidate()
    cache.regenerate(db, opts, err => {
      if (err) print(null, err)
      if (cache.data.length > 0) {
        process.stdout.write(tabulate.write(cache.data))
      } else {
        print(null, 'no keys')
      }
      repl.displayPrompt()
    })
  },

  get: function (opts, callback) {
    if (!opts) return

    callback = callback || print
    const key = opts.rest || opts

    db.get(key, function () {
      callback.apply(this, arguments)
      repl.displayPrompt()
    })
  },

  put: function (opts, callback) {
    const args = opts.rest.split(/\s+/)
    let key = args[0]
    args.shift()
    let val = args.join(' ')

    if (!val || !key) return 'key and value required'

    if (config.keyEncoding === 'json') {
      try {
        key = JSON.parse(key)
      } catch (err) {
        return print(null, 'invalid JSON key')
      }
    }

    if (!config.valueEncoding) {
      try {
        val = JSON.parse(val)
      } catch (err) {
        // It's just not a JSON value
      }
    } else if (config.valueEncoding === 'json') {
      try {
        val = JSON.parse(val)
      } catch (err) {
        return print(null, 'invalid JSON value')
      }
    }

    callback = callback || print

    db.put(key, val, function () {
      cache.data.push(key)
      callback.apply(this, arguments)
      repl.displayPrompt()
    })
  },

  del: function (opts, callback) {
    callback = callback || print
    let key = opts

    if (opts.rest) key = opts.rest

    db.del(key, function (err) {
      if (err) {
        print(null, err)
      } else {
        cache.data.splice(cache.data.indexOf(key), 1)
        callback.apply(this, arguments)
        repl.displayPrompt()
      }
    })
  },

  start: opts => {
    config.query.start = opts.rest
    console.log('SET START %s', config.query.start)
    repl.displayPrompt()
  },

  gt: opts => {
    delete config.query.gte
    config.query.gt = opts.rest
    console.log('SET GT %s', config.query.gt)
    repl.displayPrompt()
  },

  gte: opts => {
    delete config.query.gt
    config.query.gte = opts.rest
    console.log('SET GTE %s', config.query.gte)
    repl.displayPrompt()
  },

  lt: opts => {
    delete config.query.lte
    config.query.lt = opts.rest
    console.log('SET LT %s', config.query.lt)
    repl.displayPrompt()
  },

  lte: opts => {
    delete config.query.lt
    config.query.lt = opts.rest
    console.log('SET LTE %s', config.query.lte)
    repl.displayPrompt()
  },

  end: opts => {
    config.query.end = opts.rest
    console.log('SET END %s', config.query.end)
    repl.displayPrompt()
  },

  limit: opts => {
    config.query.limit = Number(opts.rest || -1)
    console.log('SET LIMIT %s', config.query.limit)
    repl.displayPrompt()
  },

  rev: opts => {
    config.query.reverse = !config.query.reverse
    console.log('SET REVERSE %s', config.query.reverse)
    repl.displayPrompt()
  }
})
