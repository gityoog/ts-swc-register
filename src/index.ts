import register from "./register"
import sourceMapSupport from 'source-map-support'
sourceMapSupport.install({
  hookRequire: true
})

register()