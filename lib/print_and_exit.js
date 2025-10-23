function print (output) {
  if (typeof output === 'object' && !(output instanceof Error)) {
    output = JSON.stringify(output)
  }
  if (output) console.log(output)
}

export function successPrintAndExit (val) {
  print(val)
  process.exit(0)
}

export function failurePrintAndExit (err) {
  print(err)
  process.exit(1)
}
