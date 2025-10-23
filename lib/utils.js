import path from 'node:path'
import { pathToFileURL } from 'node:url'

export function getAbsoluteFileUrl (filepath) {
  return pathToFileURL(path.resolve(process.cwd(), filepath))
}
