import getConfig from "../config"
import { addHook } from "pirates"
import { transformSync } from '@swc-node/core'
import module from 'module'
import fs from 'fs'

type COMPILE = (
  code: string,
  filename: string,
  rebuild?: boolean,
) => string

const nodeVersion = (process.versions.node.match(/^(\d+)\.(\d+)/) || [])
  .slice(1)
  .map(Number)

function removeNodePrefix(code: string) {
  if (nodeVersion[0] < 14 || (nodeVersion[0] === 14 && nodeVersion[1] < 18)) {
    return code.replace(
      /([\b\(])require\("node:([^"]+)"\)([\b\)])/g,
      '$1require("$2")$3',
    )
  }
  return code
}

export default function register(options = getConfig()) {
  const compile: COMPILE = function compile(source, filename, rebuild) {
    const { code } = transformSync(source, filename, options)
    if (rebuild) {
      return removeNodePrefix(code)
    }
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
      content = compile(content, filename, true)
      module._compile(content, filename)
    }
  }

  addHook(compile, {
    exts: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx']
  })
}