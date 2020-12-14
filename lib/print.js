module.exports = (err, val) => {
  let output = (err && err.message) || val || 'OK'
  if (typeof output === 'object') output = JSON.stringify(output)
  console.log(output)
}
