const fs = require('fs')
const path = require('path')
const split = require('split')
const printAndExit = require('./print_and_exit')

module.exports = function (db, file, del) {
  var batch = []
  var total = 0

  fs.createReadStream(path.resolve(file))
  .pipe(split())
  .on('data', function (line) {
    if (line[0] !== '{') return
    line = line.replace(/,$/, '')

    //
    // add each line to the batch
    //
    const entry = JSON.parse(line)
    entry.type = del ? 'del' : (entry.type || 'put')
    batch.push(entry)

    //
    // run operations by batches of 10000 entries
    //
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
  .on('close', function () {
    if (batch.length > 0) {
      db.batch(batch, (err, val) => {
        if (err) return printAndExit(err, val)
        total += batch.length
        console.log('total ops:', total)
      })
    } else {
      console.log('total ops:', total)
    }
  })
}
