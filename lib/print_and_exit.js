// print_and_exit.js
// A wrapper of print for the CLI that exits with a non-zero code
// in case of errors
import print from './print.js'

export function successPrintAndExit (val) {
  print(null, val)
  process.exit(0)
}

export function failurePrintAndExit (err, val) {
  print(err, val)
  process.exit(1)
}
