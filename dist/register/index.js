"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importStar(require("../config"));
const pirates_1 = require("pirates");
const core_1 = require("@swc-node/core");
const fs_1 = __importDefault(require("fs"));
const module_1 = __importDefault(require("module"));
const source_map_support_1 = __importDefault(require("source-map-support"));
source_map_support_1.default.install({
    hookRequire: true
});
const Module = (global.module && module.constructor.length > 1 ? module.constructor : module_1.default);
let Config = {};
function register(config = {}) {
    Config = config;
    const extensions = Module._extensions;
    const jsLoader = extensions['.js'];
    extensions['.mjs'] = extensions['.js'] = function (module, filename) {
        const isMjs = filename.endsWith('.mjs');
        try {
            return jsLoader.call(this, module, filename);
        }
        catch (error) {
            // console.log(error.message)
            if (isMjs || error.message.includes('Cannot use import statement outside a module') || error.code === 'ERR_REQUIRE_ESM') {
                let content = fs_1.default.readFileSync(filename, 'utf8');
                const { code } = (0, core_1.transformSync)(content, filename, Object.assign(Object.assign({}, tsConfig), { module: 'commonjs' }));
                // console.log('transformSync:', filename)
                module._compile(removeNodePrefix(code), filename);
            }
            else {
                throw error;
            }
        }
    };
    return (0, pirates_1.addHook)((code, filename) => {
        return compileTs(code, filename);
    }, {
        exts: ['.ts', '.tsx']
    });
}
exports.default = register;
let tsConfig;
function compileTs(source, filename) {
    if (!tsConfig) {
        if (Config.tsconfig) {
            tsConfig = (0, config_1.default)(Config.tsconfig);
        }
        if (!tsConfig && process.argv[1]) {
            tsConfig = (0, config_1.default)(process.argv[1]);
        }
        if (!tsConfig) {
            tsConfig = (0, config_1.default)(filename);
        }
        // console.log('tsConfig:', process.argv[1], filename)
        if (!tsConfig) {
            tsConfig = (0, config_1.getDefaultTsConfig)();
            console.warn('tsconfig.json not found, use default tsconfig.');
        }
    }
    const { code } = (0, core_1.transformSync)(source, filename, tsConfig);
    return code;
}
const nodeVersion = (process.versions.node.match(/^(\d+)\.(\d+)/) || [])
    .slice(1)
    .map(Number);
function removeNodePrefix(code) {
    if (nodeVersion[0] < 14 || (nodeVersion[0] === 14 && nodeVersion[1] < 18)) {
        return code.replace(/([\b\(])require\("node:([^"]+)"\)([\b\)])/g, '$1require("$2")$3');
    }
    return code;
}
