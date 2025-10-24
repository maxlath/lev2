import 'should'
import { getRandomString, shellExecLev, testDb } from './utils.js'

describe('--keys', () => {
  it('should get an utf8 value', async () => {
    const key = getRandomString()
    await testDb.put(key, '')
    const line = await getLine(`--keys --prefix ${key}`)
    line.should.equal(key)
  })

  it('should get a json value', async () => {
    const key = `{"a":"${getRandomString()}"}`
    await testDb.put(key, '', { keyEncoding: 'json' })
    const line = await getLine(`--keys --prefix '${key}' --keyEncoding json`)
    line.should.equal(key)
  })

  it('should get a binary value as hexadecimal', async () => {
    const uint64 = Date.now()
    const buffer = Buffer.alloc(6)
    buffer.writeUIntBE(uint64, 0, 6)
    await testDb.put(buffer, '')
    const line = await getLine(`--keys --prefix ${buffer.toString('hex')} --keyEncoding hex`)
    line.should.equal(buffer.toString('hex'))
  })

  it('should get a binary value as base64', async () => {
    const uint64 = Date.now()
    const buffer = Buffer.alloc(6)
    buffer.writeUIntBE(uint64, 0, 6)
    await testDb.put(buffer, '')
    const line = await getLine(`--keys --prefix ${buffer.toString('base64')} --keyEncoding base64`)
    line.should.equal(buffer.toString('base64'))
  })
})

async function getLine (cmd) {
  const { stdout } = await shellExecLev(cmd)
  const lines = stdout.trim().split('\n')
  lines.length.should.equal(1)
  return lines[0]
}
