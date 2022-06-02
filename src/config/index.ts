import ts from 'typescript'
import path from 'path'
import type { Options } from '@swc-node/core'
import tsConfigPaths from 'tsconfig-paths'

export default function getConfig() {
  const configFile = ts.findConfigFile(path.dirname(process.argv[1]), ts.sys.fileExists)
  if (configFile) {
    const { config, error } = ts.readConfigFile(configFile, ts.sys.readFile)
    if (error) {
      throw error
    }
    const { options, errors } = ts.parseJsonConfigFileContent(config, ts.sys, path.dirname(configFile))
    if (errors.length > 0) {
      throw errors
    }
    if (options.baseUrl) {
      tsConfigPaths.register({
        baseUrl: options.baseUrl,
        paths: options.paths || {},
      })
    }
    return tsCompilerOptionsToSwcConfig(options)
  } else {
    throw new Error('No tsconfig.json found')
  }
}

function toTsTarget(target: ts.ScriptTarget): Options['target'] {
  switch (target) {
    case ts.ScriptTarget.ES3:
      return 'es3'
    case ts.ScriptTarget.ES5:
      return 'es5'
    case ts.ScriptTarget.ES2015:
      return 'es2015'
    case ts.ScriptTarget.ES2016:
      return 'es2016'
    case ts.ScriptTarget.ES2017:
      return 'es2017'
    case ts.ScriptTarget.ES2018:
      return 'es2018'
    case ts.ScriptTarget.ES2019:
      return 'es2019'
    case ts.ScriptTarget.ES2020:
      return 'es2020'
    case ts.ScriptTarget.ES2021:
    case ts.ScriptTarget.ES2022:
    case ts.ScriptTarget.ESNext:
    case ts.ScriptTarget.Latest:
      return 'es2021'
    case ts.ScriptTarget.JSON:
      return 'es5'
  }
}

function toModule(moduleKind: ts.ModuleKind) {
  switch (moduleKind) {
    case ts.ModuleKind.CommonJS:
      return 'commonjs'
    case ts.ModuleKind.UMD:
      return 'umd'
    case ts.ModuleKind.AMD:
      return 'amd'
    case ts.ModuleKind.ES2015:
    case ts.ModuleKind.ES2020:
    case ts.ModuleKind.ES2022:
    case ts.ModuleKind.ESNext:
    case ts.ModuleKind.NodeNext:
    case ts.ModuleKind.None:
      return 'es6'
    case ts.ModuleKind.System:
      throw new TypeError('Do not support system kind module')
  }
}

function createSourcemapOption(options: ts.CompilerOptions) {
  return options.sourceMap !== false
    ? options.inlineSourceMap
      ? 'inline'
      : true
    : options.inlineSourceMap
      ? 'inline'
      : false
}

function tsCompilerOptionsToSwcConfig(options: ts.CompilerOptions): Options {
  return {
    target: toTsTarget(options.target ?? ts.ScriptTarget.ES2018),
    module: toModule(options.module ?? ts.ModuleKind.ES2015),
    sourcemap: createSourcemapOption(options),
    jsx: Boolean(options.jsx),
    react:
      options.jsxFactory || options.jsxFragmentFactory || options.jsx || options.jsxImportSource
        ? {
          pragma: options.jsxFactory,
          pragmaFrag: options.jsxFragmentFactory,
          importSource: options.jsxImportSource,
          runtime: (options.jsx ?? 0) >= ts.JsxEmit.ReactJSX ? 'automatic' : 'classic',
        }
        : undefined,
    experimentalDecorators: options.experimentalDecorators ?? false,
    emitDecoratorMetadata: options.emitDecoratorMetadata ?? false,
    dynamicImport: true,
    esModuleInterop: options.esModuleInterop ?? false,
    keepClassNames: true,
    paths: options.paths as Options['paths'],
  }
}