// If any of these commands are specified as arguments
// than the program should not be run in REPL mode.
export const cliCommands = [
  'all',
  'batch',
  'count',
  'del',
  'end',
  'get',
  'gt',
  'gte',
  'keys',
  'limit',
  'lt',
  'lte',
  'map',
  'match',
  'prefix',
  'put',
  'reverse',
  'start',
  'value',
  'values',
]

export const others = [
  'help',
  'valueEncoding',
  'location',
]

export const validOptions = cliCommands
  .concat(others)
  .map(cmd => `--${cmd}`)
