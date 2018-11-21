// All the magic needed for auto completion

module.exports = function setupCompletion (repl, cache) {
  const compl = repl.complete

  repl.complete = function (line, callback) {
    const match = line.match(cmdRE) || line.match(fnRE)
    var filter = []

    if (match) {
      if (cache.data.length === 0) {
        callback(null, [[], ''])
      } else {
        filter = cache.data.filter(e => {
          return e.match(new RegExp('^' + escapeRE(match[1]) + '(?:.*?)$'))
        })
      }

      const list = (filter.length > 0) ? filter : cache.data
      const partialRE = new RegExp('(' + escapeRE(match[1]) + ')(.*?)')

      if (filter.length > 0) {
        list.forEach((item, i) => {
          list[i] = '\u001b[34m' + list[i].replace(partialRE, '$1\u001b[39m')
        })
      }

      return callback(null, [list, '\u001b[34m' + match[1] + '\u001b[39m'])
    }
    compl.apply(this, arguments)
  }
}

const cmdRE = /\b(?:get|del|cd|ls)\s+(.*)/
const fnRE = /\b(?:get|del|delr|put)\(['|"](.*)/
const escapeRE = str => str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
