import getConfig, { getDefaultTsConfig } from "../config"
import { addHook } from "pirates"
import { transformSync } from '@swc-node/core'
import fs from 'fs'
import type { Options } from '@swc-node/core'
import BuiltinModule from 'module'
import sourceMapSupport from 'source-map-support'

sourceMapSupport.install({
  hookRequire: true
})

const Module = (global.module && module.constructor.length > 1 ? module.constructor : BuiltinModule) as unknown as {
  _extensions: Record<string, (module: {
    _compile: (content: string, filename: string) => string
  }, filename: string) => any>
}
type Config = {
  tsconfig?: string
}
let Config: Config = {}
export default function register(config: Config = {}) {
  Config = config
  const extensions = Module._extensions
  const jsLoader = extensions['.js']
  extensions['.mjs'] = extensions['.js'] = function (module, filename) {
    const isMjs = filename.endsWith('.mjs')
    try {
      return jsLoader.call(this, module, filename)
    } catch (error: any) {
      if (isMjs || error.message.includes('Unexpected token \'export\'') || error.message.includes('Cannot use import statement outside a module') || error.code === 'ERR_REQUIRE_ESM') {
        let content = fs.readFileSync(filename, 'utf8')
        const { code } = transformSync(content, filename, {
          ...tsConfig,
          module: 'commonjs'
        })
        // console.log('transformSync:', filename)
        module._compile(removeNodePrefix(code), filename)
      } else {
        throw error
      }
    }
  }
  return addHook((code, filename) => {
    return compileTs(code, filename)
  }, {
    exts: ['.ts', '.tsx']
  })
}

let tsConfig: Options | undefined

function compileTs(source: string, filename: string) {
  if (!tsConfig) {
    if (Config.tsconfig) {
      tsConfig = getConfig(Config.tsconfig)
    }
    if (!tsConfig && process.argv[1]) {
      tsConfig = getConfig(process.argv[1])
    }
    if (!tsConfig) {
      tsConfig = getConfig(filename)
    }
    // console.log('tsConfig:', process.argv[1], filename)
    if (!tsConfig) {
      tsConfig = getDefaultTsConfig()
      console.warn('tsconfig.json not found, use default tsconfig.')
    }
  }
  const { code } = transformSync(source, filename, tsConfig)
  return code
}

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