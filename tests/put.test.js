import 'should'
import { getRandomString, shellExecLev, testDb } from './utils.js'

describe('--put', () => {
  it('should put an utf8 value', async () => {
    const value = getRandomString()
    const { stdout, stderr } = await shellExecLev(`--put foo --value ${value}`)
    stdout.should.equal('')
    stderr.should.equal('')
    const res = await testDb.get('foo')
    res.should.equal(value)
  })

  it('should put a json value', async () => {
    const value = getRandomString()
    const json = `{"a":"${value}"}`
    await shellExecLev(`--put foo --value '${json}' --valueEncoding json`)
    const res = await testDb.get('foo', { valueEncoding: 'json' })
    res.should.equal(json)
  })

  it('should put a binary value as hexadecimal', async () => {
    const uint64 = Date.now()
    const buffer = Buffer.alloc(6)
    buffer.writeUIntBE(uint64, 0, 6)
    const encoded = buffer.toString('hex')
    await shellExecLev(`--put foo --value ${encoded} --valueEncoding hex`)
    const res = await testDb.get('foo', { valueEncoding: 'base64' })
    Buffer.from(res, 'base64').readUIntBE(0, 6).should.equal(uint64)
  })

  it('should put a binary value as base64', async () => {
    const uint64 = Date.now()
    const buffer = Buffer.alloc(6)
    buffer.writeUIntBE(uint64, 0, 6)
    const encoded = buffer.toString('base64')
    await shellExecLev(`--put foo --value ${encoded} --valueEncoding base64`)
    const res = await testDb.get('foo', { valueEncoding: 'hex' })
    Buffer.from(res, 'hex').readUIntBE(0, 6).should.equal(uint64)
  })
})
