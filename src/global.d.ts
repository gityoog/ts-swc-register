declare module 'source-map-support' {
  export function install(options: {
    hookRequire?: boolean
    handleUncaughtExceptions?: boolean
    environment?: 'auto' | 'node' | 'browser' | 'auto'
    retrieveSourceMap?: (source: string) => { url: string, map: string }
    overrideRetrieveFile?: boolean
    emptyCacheBetweenOperations?: boolean
    handleUncaughtExceptionsDuringInit?: boolean
    overrideRetrieveSourceMap?: boolean
    ignoreSourceMapSupport?: boolean
    handleUncaughtExceptionsDuringInstall?: boolean
  }): void
}