// Save the keys from the readstream into an
// array so that they can be autocompleted and suggested

const cache = {
  data: [],

  invalidate: () => {
    cache.data = []
  },

  regenerate: (db, opts, cb) => {
    let error

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
  },
}
export default cache
