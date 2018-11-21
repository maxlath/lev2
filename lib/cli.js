// All the functions to invoke the right leveldb methods
// from the commandline

const print = require('./print')
const printAndExit = require('./print_and_exit')
const minimatch = require('minimatch')
const path = require('path')

module.exports = function (db, args) {
  if (!hasStreamArg(args) && (args.start || args.end || args.limit || args.map)) {
    args.all = true
  }

  var mapFn
  if (args.map) {
    try {
      mapFn = require(path.resolve(args.map))
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') throw err
      /* eslint-disable no-eval */
      mapFn = eval(args.map)
    }
  }

  if (hasStreamArg(args)) {
    const valueEncoding = args.valueEncoding || 'json'
    if (args.start) args.gte = args.start
    if (args.end) args.lte = args.end

    const { keys, values } = args
    const limit = typeof args.limit === 'number' ? args.limit : Infinity
    var count = 0

    if (args.match) {
      delete args.values
      delete args.keys
      delete args.limit
    } else if (args.map) {
      delete args.limit
    } else if (args.length) {
      args.keys = true
    }

    if (args.keys) args.values = false
    if (args.values) args.keys = false

    db.createReadStream(args)
    .on('data', function (data) {
      if (args.match && !minimatch(data.key, args.match)) return

      if (++count > limit) {
        count--
        return this.emit('end')
      }

      if (args.length) return

      if (args.match) {
        if (keys) data = data.key
        if (values) data = data.value
      }

      if (args.map) {
        data = mapFn(data)
        if (data == null) {
          count--
          return
        }
      }

      if (valueEncoding === 'json') {
        if (typeof data !== 'string') data = JSON.stringify(data)
        process.stdout.write(data + '\n')
      } else {
        process.stdout.write(data)
      }
    })
    .on('error', print)
    .on('end', function () {
      if (args.length) {
        process.stdout.write(count + '\n')
      }
      const exitCode = count > 0 ? 0 : 1
      process.exit(exitCode)
    })
  // Test args.batch before args.del to be able to pass a --del flag
  // to the --batch option
  } else if (args.batch) {
    if (args.batch[0] !== '[') {
      // If --batch is called without a filepath as argument, process.stdin will be used
      const file = typeof args.batch === 'string' ? args.batch : null
      require('./batch_from_file')({
        db,
        file,
        del: args.del,
        key: args['batch-key']
      })
      return
    }
    var batch = JSON.parse(args.batch)
    if (args.del) {
      batch = batch.map(op => {
        op.type = 'del'
        return op
      })
    }
    db.batch(batch, printAndExit)
  } else if (args.put) {
    db.put(args.key || args.put, args.value, printAndExit)
  } else if (args.get) {
    db.get(args.key || args.get, printAndExit)
  } else if (args.del) {
    db.del(args.key || args.del, printAndExit)
  } else {
    printAndExit(new Error('No valid command'))
  }
}

const hasStreamArg = args => {
  return args.all || args.values || args.keys || args.match || args.length
}
