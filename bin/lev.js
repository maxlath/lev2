#!/usr/bin/env node
import rc from 'rc'
import { validOptions } from '../lib/options.js'
import showHelp from '../lib/show_help.js'

const args = process.argv.slice(2)

args.forEach(arg => {
  if (arg.startsWith('--') && !validOptions.includes(arg)) {
    console.error(`invalid option: ${arg}\nvalid options: ${validOptions.join(' ')}`)
    process.exit(1)
  }
})

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  showHelp()
} else {
  const parsedArgs = rc('lev')
  parsedArgs.limit ??= parsedArgs.n
  parsedArgs.keys ??= parsedArgs.k
  parsedArgs.values ??= parsedArgs.v
  parsedArgs.all ??= parsedArgs.a
  const { default: lev } = await import('../lib/index.js')
  await lev(parsedArgs)
}

// Prevent logging an EPIPE error when piping the output
// cf https://github.com/maxlath/wikidata-cli/issues/7
process.stdout.on('error', err => {
  if (err.code === 'EPIPE') process.exit(0)
  else throw err
})
