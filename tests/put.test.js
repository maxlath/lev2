import 'should'
import { getRandomString, shellExecLev, testDb } from './utils.js'

describe('--put', () => {
  it('should put an utf8 key and value by default', async () => {
    const key = getRandomString()
    const value = getRandomString()
    const { stdout, stderr } = await shellExecLev(`--put ${key} --value ${value}`)
    stdout.should.equal('')
    stderr.should.equal('')
    const res = await testDb.get(key)
    res.should.equal(value)
  })

  // Fails when run with other tests, but should work alone
  xit('should put a json key', async () => {
    const key = `{"a":"${getRandomString()}"}`
    const value = getRandomString()
    await shellExecLev(`--put '${key}' --value ${value} --keyEncoding json`)
    const res = await testDb.get(key, { keyEncoding: 'json' })
    res.should.equal(value)
  })

  it('should put a binary key as hexadecimal', async () => {
    const uint64 = Date.now()
    const buffer = Buffer.alloc(6)
    buffer.writeUIntBE(uint64, 0, 6)
    const encodedKey = buffer.toString('hex')
    const value = getRandomString()
    await shellExecLev(`--put ${encodedKey} --value ${value} --keyEncoding hex`)
    const res = await testDb.get(encodedKey, { keyEncoding: 'hex' })
    res.should.equal(value)
  })

  it('should put a binary key as base64', async () => {
    const uint64 = Date.now()
    const buffer = Buffer.alloc(6)
    buffer.writeUIntBE(uint64, 0, 6)
    const encodedKey = buffer.toString('base64')
    const value = getRandomString()
    await shellExecLev(`--put ${encodedKey} --value ${value} --keyEncoding base64`)
    const res = await testDb.get(encodedKey, { keyEncoding: 'base64' })
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
