import 'should'
import { getRandomString, shellExecLev, testDb } from './utils.js'

describe('--get', () => {
  it('should get an utf8 value', async () => {
    const value = getRandomString()
    await testDb.put('foo', value)
    const { stdout } = await shellExecLev('--get foo')
    stdout.should.equal(value)
  })

  it('should get a json value', async () => {
    const value = getRandomString()
    const json = `{"a":"${value}"}`
    await testDb.put('foo', json, { valueEncoding: 'json' })
    const { stdout } = await shellExecLev('--get foo --valueEncoding json')
    stdout.should.equal(json)
  })

  it('should get a binary value as hexadecimal', async () => {
    const uint64 = Date.now()
    const buffer = Buffer.alloc(6)
    buffer.writeUIntBE(uint64, 0, 6)
    await testDb.put('foo', buffer)
    const { stdout } = await shellExecLev('--get foo --valueEncoding hex')
    const decodedNum = Buffer.from(stdout, 'hex').readUIntBE(0, 6)
    decodedNum.should.equal(uint64)
  })

  it('should get a binary value as base64', async () => {
    const uint64 = Date.now()
    const buffer = Buffer.alloc(6)
    buffer.writeUIntBE(uint64, 0, 6)
    await testDb.put('foo', buffer)
    const { stdout } = await shellExecLev('--get foo --valueEncoding base64')
    const decodedNum = Buffer.from(stdout, 'base64').readUIntBE(0, 6)
    decodedNum.should.equal(uint64)
  })
})
