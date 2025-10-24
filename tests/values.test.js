import 'should'
import { getRandomString, shellExecLev, testDb } from './utils.js'

describe('--values', () => {
  it('should get an utf8 value', async () => {
    const value = getRandomString()
    await testDb.put('foo', value)
    const line = await getLine('--values --prefix foo')
    line.should.equal(value)
  })

  it('should get a json value', async () => {
    const value = getRandomString()
    const json = `{"a":"${value}"}`
    await testDb.put('foo', json, { valueEncoding: 'json' })
    const line = await getLine('--values --prefix foo --valueEncoding json')
    line.should.equal(json)
  })

  it('should get a binary value as hexadecimal', async () => {
    const uint64 = Date.now()
    const buffer = Buffer.alloc(6)
    buffer.writeUIntBE(uint64, 0, 6)
    await testDb.put('foo', buffer)
    const line = await getLine('--values --prefix foo --valueEncoding hex')
    line.should.equal(buffer.toString('hex'))
  })

  it('should get a binary value as base64', async () => {
    const uint64 = Date.now()
    const buffer = Buffer.alloc(6)
    buffer.writeUIntBE(uint64, 0, 6)
    await testDb.put('foo', buffer)
    const line = await getLine('--values --prefix foo --valueEncoding base64')
    line.should.equal(buffer.toString('base64'))
  })
})

async function getLine (cmd) {
  const { stdout } = await shellExecLev(cmd)
  const lines = stdout.trim().split('\n')
  lines.length.should.equal(1)
  return lines[0]
}
