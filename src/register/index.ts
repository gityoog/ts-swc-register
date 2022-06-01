import getConfig from "../config"
import { addHook } from "pirates"
import { transformSync } from '@swc-node/core'
import module from 'module'
import fs from 'fs'

type COMPILE = (
  code: string,
  filename: string,
  format?: 'cjs' | 'esm',
) => string

export default function register(options = getConfig()) {
  const compile: COMPILE = function compile(source, filename) {
    const { code } = transformSync(source, filename, options)
    return code
  }
  // @ts-ignore
  const extensions = module.Module._extensions
  const jsLoader = extensions['.js']

  extensions['.js'] = function (module: any, filename: string) {
    try {
      return jsLoader.call(this, module, filename)
    } catch (error: any) {
      if (error.code !== 'ERR_REQUIRE_ESM') {
        throw error
      }
      let content = fs.readFileSync(filename, 'utf8')
      content = compile(content, filename, 'cjs')
      module._compile(content, filename)
    }
  }

  addHook(compile, {
    exts: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx']
  })
}