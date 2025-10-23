// Responsible for adding custom commands to the REPL context

import REPL from 'node:repl'

const replConfig = {
  prompt: '/>',
  input: process.stdin,
  output: process.stdout,
  ignoreUndefined: true,
}

export async function createREPL (db, config, cache) {
  config.query = config.query || {}

  const repl = REPL.start(replConfig)

  const { default: cmds } = await import('./repl_commands.js')(repl, db, config, cache)
  cmds.rm = cmds.del

  Object.keys(cmds).forEach(cmd => {
    cmds[cmd.toUpperCase()] = cmds[cmd]
  })

  const methods = Object.keys(cmds)

  Object.assign(repl.context, cmds)

  const onLine = repl.rli._onLine

  repl.rli._onLine = function (data) {
    const line = data.trim().split(' ')
    const method = line.splice(0, 1)[0]

    if (methods.indexOf(method) > -1) {
      repl.rli.emit('record', data)
      const rest = line.join(' ')
      cmds[method]({ rest })
      return
    }
    return onLine.apply(repl.rli, arguments)
  }

  return repl
}
