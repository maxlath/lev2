// All the functions to invoke the right leveldb methods
// from the commandline

import minimatch from 'minimatch'
import { failurePrintAndExit, successPrintAndExit } from './print_and_exit.js'
import { getAbsoluteFileUrl } from './utils.js'

export async function cli (db, args) {
  if (!hasStreamArg(args) && (args.start || args.end || args.gt || args.lt || args.gte || args.lte || args.prefix || args.limit || args.map)) {
    args.all = true
  }

  // Only keys are need to perpare delete ops
  if (args.all && args.del === true) {
    delete args.all
    args.keys = true
  }

  let mapFn
  if (args.map) {
    try {
      mapFn = await import(getAbsoluteFileUrl(args.map))
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') throw err

      mapFn = eval(args.map)
    }
  }

  if (args.prefix) {
    args.gte = args.prefix
    args.lte = args.prefix + '\uffff'
  }

  if (hasStreamArg(args)) {
    const valueEncoding = args.valueEncoding || 'utf8'
    if (args.start) args.gte = args.start
    if (args.end) args.lte = args.end

    const { keys, values } = args
    const limit = typeof args.limit === 'number' ? args.limit : Infinity
    let count = 0

    if (args.match) {
      delete args.values
      delete args.keys
      delete args.limit
    } else if (args.map) {
      delete args.limit
    } else if (args.count) {
      args.keys = true
    }

    if (args.keys) args.values = false
    if (args.values) {
      // Decode JSON values manually below
      if (args.valueEncoding === 'json') args.valueEncoding = 'utf8'
      args.keys = false
    }

    db.createReadStream(args)
    .on('data', function (data) {
      try {
        if (typeof data === 'string' && data.trim() === '') return
        if (args.match && !minimatch(data.key, args.match)) return

        if (++count > limit) {
          count--
          return this.emit('end')
        }

        if (args.count) return

        // Allows to prepare a batch delete
        if (args.keys && args.del) {
          data = { key: data, type: 'del' }
        }

        if (args.match) {
          if (args.del) {
            data = { key: data.key, type: 'del' }
          } else {
            if (keys) data = data.key
            if (values) data = data.value
          }
        }

        if (args.map) {
          data = mapFn(data)
          if (data == null) {
            count--
            return
          }
        }

        if (valueEncoding === 'json') {
          if (typeof data === 'object' && 'key' in data && 'value' in data && typeof data.value === 'string') {
            data.value = JSON.parse(data.value)
          } else if (args.values && typeof data === 'string') {
            data = JSON.parse(data)
          }
        }
        if (typeof data !== 'string') data = JSON.stringify(data)
        process.stdout.write(data + '\n')
      } catch (err) {
        failurePrintAndExit(err)
      }
    })
    .on('error', err => {
      const streamErr = new Error(`stream error\nContext: ${JSON.stringify(args, null, 2)}`)
      streamErr.cause = err
      failurePrintAndExit(streamErr)
    })
    .on('end', () => {
      if (args.count) {
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
      const { batchFromFile } = await import('./batch_from_file.js')
      batchFromFile({
        db,
        file,
        del: args.del,
        key: args['batch-key'],
      })
      return
    }
    let batch = JSON.parse(args.batch)
    if (args.del) {
      batch = batch.map(op => {
        op.type = 'del'
        return op
      })
    }
    await db.batch(batch)
    .then(successPrintAndExit)
    .catch(failurePrintAndExit)
  } else if (args.put) {
    await db.put(args.key || args.put, args.value)
    .then(successPrintAndExit)
    .catch(failurePrintAndExit)
  } else if (args.get) {
    await db.get(args.key || args.get)
    .then(successPrintAndExit)
    .catch(failurePrintAndExit)
  } else if (args.del) {
    await db.del(args.key || args.del)
    .then(successPrintAndExit)
    .catch(failurePrintAndExit)
  } else if (args.create) {
    successPrintAndExit()
  } else {
    failurePrintAndExit(new Error('No valid command'))
  }
}

const hasStreamArg = args => {
  return args.all || args.values || args.keys || args.match || args.count
}
