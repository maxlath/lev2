// All the magic needed to save and load each entry
// that is made in the repl.

import fs from 'node:fs'
import path from 'node:path'

export default (repl, args) => {
  const file = path.join(args.path, '.lev_history')

  loadPreviousSessionsHistory(repl, file)
  recordCurrentSessionHistory(repl, file)
}

const loadPreviousSessionsHistory = (repl, file) => {
  try {
    const history = fs.readFileSync(file, 'utf8')
    const historyLines = history.split('\n')

    historyLines.forEach(line => {
      if (line) repl.rli.history.unshift(line)
    })
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    //
  }
}

const recordCurrentSessionHistory = (repl, file) => {
  const stream = fs.createWriteStream(file, { flags: 'a+' })

  const record = line => stream.write(line + '\n')

  repl.rli.on('line', record)
  repl.rli.on('record', record)
}
