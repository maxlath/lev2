function print (err, val) {
  let output = (err && err.message) || val
  if (typeof output === 'object') output = JSON.stringify(output)
  if (output) console.log(output)
}

export function successPrintAndExit (val) {
  print(null, val)
  process.exit(0)
}

export function failurePrintAndExit (err, val) {
  print(err, val)
  process.exit(1)
}
