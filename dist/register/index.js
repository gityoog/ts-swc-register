"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
const pirates_1 = require("pirates");
const core_1 = require("@swc-node/core");
const module_1 = __importDefault(require("module"));
const fs_1 = __importDefault(require("fs"));
function register(options = (0, config_1.default)()) {
    const compile = function compile(source, filename) {
        const { code } = (0, core_1.transformSync)(source, filename, options);
        return code;
    };
    // @ts-ignore
    const extensions = module_1.default.Module._extensions;
    const jsLoader = extensions['.js'];
    extensions['.js'] = function (module, filename) {
        try {
            return jsLoader.call(this, module, filename);
        }
        catch (error) {
            if (error.code !== 'ERR_REQUIRE_ESM') {
                throw error;
            }
            let content = fs_1.default.readFileSync(filename, 'utf8');
            content = compile(content, filename, 'cjs');
            module._compile(content, filename);
        }
    };
    (0, pirates_1.addHook)(compile, {
        exts: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx']
    });
}
exports.default = register;
