/*
 *
 * cache.js
 * save the keys from the readstream into an
 * array so that they can be autocompleted and suggested.
 *
 */
const cache = module.exports = {
  data: [],

  invalidate: () => {
    cache.data = []
  },

  regenerate: (db, opts, cb) => {
    var error

    db.createReadStream(opts)
    .on('data', data => {
      cache.data.push(data.key)
    })
    .on('error', err => {
      error = err
      cb(error)
    })
    .on('end', () => {
      if (error) return
      cb()
    })
  }
}
