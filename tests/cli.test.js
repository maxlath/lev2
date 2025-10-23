import 'should'
import { getRandomString, shellExecLev } from './utils.js'

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
      await shellExecLev(`--put foo --value ${value}`)
      const { stdout } = await shellExecLev('--get foo')
      stdout.should.equal(value)
    })
  })
})
