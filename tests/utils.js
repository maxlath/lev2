import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { RaveLevel } from 'rave-level'
import { grey, yellow } from 'tiny-chalk'

const { LEV_TESTS_DIR } = process.env

const execAsync = promisify(exec)

export async function shellExecLev (cmd, options = {}) {
  const command = `./bin/lev.js ${LEV_TESTS_DIR} ${cmd}`
  console.error(grey(command))
  try {
    let { stdout, stderr } = await execAsync(command)
    if (options.trim !== false) {
      stdout = stdout.trim()
      stderr = stderr.trim()
    }
    return { stdout, stderr }
  } catch (err) {
    console.error(err.message, err.stdout, err.stderr)
    throw err
  }
}

// A function to quickly fail when a test gets an undesired positive answer
export const undesiredRes = done => res => {
  console.warn(res, 'undesired positive res')
  done(new Error('.then function was expected not to be called'))
}

// Same but for async/await tests that don't use done
export function shouldNotBeCalled (res) {
  console.warn(yellow('undesired positive res:'), res)
  const err = new Error('function was expected not to be called')
  err.name = 'shouldNotBeCalled'
  err.context = { res }
  throw err
}

export const getRandomString = () => Math.random().toString(36).slice(2, 10)

export const testDb = new RaveLevel(LEV_TESTS_DIR)
