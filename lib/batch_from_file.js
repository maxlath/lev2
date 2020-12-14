const fs = require('fs')
const path = require('path')
const split = require('split')
const printAndExit = require('./print_and_exit')

module.exports = function (params) {
  const { db, file, del, key } = params
  let batch = []
  let total = 0

  let stream
  if (file) {
    stream = fs.createReadStream(path.resolve(file))
  } else if (!process.stdin.isTTY) {
    stream = process.stdin
  } else {
    throw new Error('no file path or stdin input provided')
  }

  stream
  .pipe(split())
  .on('data', function (line) {
    if (line[0] !== '{') return
    line = line.replace(/,$/, '')

    // Add each line to the batch
    let entry = JSON.parse(line)

    entry.type = del ? 'del' : (entry.type || 'put')

    // If a key is specified, the entry is the value and the key
    // should be taken from the specified attribute
    if (key) {
      if (!entry[key]) throw new Error(`couldn't find the key ${key} on ${line}`)
      entry = { key: entry[key], value: JSON.stringify(entry) }
    } else {
      if (entry.key == null) throw new Error(`no key provided: ${line}`)
      if (entry.value == null && entry.type !== 'del') throw new Error(`no value provided: ${line}`)
    }

    batch.push(entry)

    // run operations by batches of 10000 entries
    if (batch.length >= 10000) {
      const stream = this
      stream.pause()
      db.batch(batch, (err, val) => {
        if (err) return printAndExit(err, val)
        total += batch.length
        console.log('ops run:', total)
        batch = []
        stream.resume()
      })
    }
  })
  .on('close', () => {
    if (batch.length > 0) {
      db.batch(batch, (err, val) => {
        if (err) return printAndExit(err, val)
        total += batch.length
        console.log('total ops:', total)
        process.exit(0)
      })
    } else {
      console.log('total ops:', total)
      process.exit(0)
    }
  })
}
