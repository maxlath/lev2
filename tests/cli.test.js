import 'should'
import { getRandomString, shellExecLev, testDb } from './utils.js'

describe('cli', () => {
  describe('get', () => {
    it('should get a value', async () => {
      const value = getRandomString()
      await shellExecLev(`--put foo --value ${value}`)
      const { stdout } = await shellExecLev('--get foo')
      stdout.should.equal(value)
    })
  })

  describe('put', () => {
    it('should put a value', async () => {
      const value = getRandomString()
      const { stdout, stderr } = await shellExecLev(`--put foo --value ${value}`)
      stdout.should.equal('')
      stderr.should.equal('')
      const { stdout: getStdout } = await shellExecLev('--get foo')
      getStdout.should.equal(value)
    })
  })

  describe('valueEncoding', () => {
    describe('utf8 (default)', async () => {
      const value = getRandomString()
      before(async () => {
        await shellExecLev(`--put foo --value ${value}`)
      })
      it('--get', async () => {
        const { stdout } = await shellExecLev('--get foo')
        stdout.should.equal(value)
      })
      it('--all/--prefix', async () => {
        const { stdout: stdout } = await shellExecLev('--prefix foo')
        const lines = stdout.trim().split('\n')
        lines.length.should.equal(1)
        lines[0].should.equal(`{"key":"foo","value":"${value}"}`)
      })
      it('--values', async () => {
        const { stdout } = await shellExecLev('--values foo')
        const lines = stdout.trim().split('\n')
        lines.length.should.equal(1)
        lines[0].should.equal(value)
      })
    })

    describe('json', async () => {
      const value = getRandomString()
      const json = `{"a":"${value}"}`
      before(async () => {
        await shellExecLev(`--put foo --value '${json}' --valueEncoding json`)
      })
      it('--get', async () => {
        const { stdout } = await shellExecLev('--get foo --valueEncoding json')
        stdout.should.equal(json)
      })
      it('--all/--prefix', async () => {
        const { stdout: prefixStdout } = await shellExecLev('--prefix foo --valueEncoding json')
        const lines = prefixStdout.trim().split('\n')
        lines.length.should.equal(1)
        lines[0].should.equal(`{"key":"foo","value":${json}}`)
      })
      it('--values', async () => {
        const { stdout: prefixStdout } = await shellExecLev('--values foo --valueEncoding json')
        const lines = prefixStdout.trim().split('\n')
        lines.length.should.equal(1)
        lines[0].should.equal(json)
      })
    })

    describe('binary', async () => {
      const num = Date.now()
      const buffer = Buffer.alloc(6)
      buffer.writeUIntBE(num, 0, 6)

      before(async () => {
        await testDb.put('foo', buffer)
      })

      describe('hex', () => {
        it('--get', async () => {
          const { stdout } = await shellExecLev('--get foo --valueEncoding hex')
          const decodedNum = Buffer.from(stdout, 'hex').readUIntBE(0, 6)
          decodedNum.should.equal(num)
        })
      })

      describe('base64', () => {
        it('--get', async () => {
          const { stdout } = await shellExecLev('--get foo --valueEncoding base64')
          const decodedNum = Buffer.from(stdout, 'base64').readUIntBE(0, 6)
          decodedNum.should.equal(num)
        })
      })
    })
  })
})
