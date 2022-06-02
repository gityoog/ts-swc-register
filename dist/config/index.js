"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const path_1 = __importDefault(require("path"));
const tsconfig_paths_1 = __importDefault(require("tsconfig-paths"));
function getConfig() {
    const configFile = typescript_1.default.findConfigFile(path_1.default.dirname(process.argv[1]), typescript_1.default.sys.fileExists);
    if (configFile) {
        const { config, error } = typescript_1.default.readConfigFile(configFile, typescript_1.default.sys.readFile);
        if (error) {
            throw error;
        }
        const { options, errors } = typescript_1.default.parseJsonConfigFileContent(config, typescript_1.default.sys, path_1.default.dirname(configFile));
        if (errors.length > 0) {
            throw errors;
        }
        if (options.baseUrl) {
            tsconfig_paths_1.default.register({
                baseUrl: options.baseUrl,
                paths: options.paths || {},
            });
        }
        return tsCompilerOptionsToSwcConfig(options);
    }
    else {
        throw new Error('No tsconfig.json found');
    }
}
exports.default = getConfig;
function toTsTarget(target) {
    switch (target) {
        case typescript_1.default.ScriptTarget.ES3:
            return 'es3';
        case typescript_1.default.ScriptTarget.ES5:
            return 'es5';
        case typescript_1.default.ScriptTarget.ES2015:
            return 'es2015';
        case typescript_1.default.ScriptTarget.ES2016:
            return 'es2016';
        case typescript_1.default.ScriptTarget.ES2017:
            return 'es2017';
        case typescript_1.default.ScriptTarget.ES2018:
            return 'es2018';
        case typescript_1.default.ScriptTarget.ES2019:
            return 'es2019';
        case typescript_1.default.ScriptTarget.ES2020:
            return 'es2020';
        case typescript_1.default.ScriptTarget.ES2021:
        case typescript_1.default.ScriptTarget.ES2022:
        case typescript_1.default.ScriptTarget.ESNext:
        case typescript_1.default.ScriptTarget.Latest:
            return 'es2021';
        case typescript_1.default.ScriptTarget.JSON:
            return 'es5';
    }
}
function toModule(moduleKind) {
    switch (moduleKind) {
        case typescript_1.default.ModuleKind.CommonJS:
            return 'commonjs';
        case typescript_1.default.ModuleKind.UMD:
            return 'umd';
        case typescript_1.default.ModuleKind.AMD:
            return 'amd';
        case typescript_1.default.ModuleKind.ES2015:
        case typescript_1.default.ModuleKind.ES2020:
        case typescript_1.default.ModuleKind.ES2022:
        case typescript_1.default.ModuleKind.ESNext:
        case typescript_1.default.ModuleKind.NodeNext:
        case typescript_1.default.ModuleKind.None:
            return 'es6';
        case typescript_1.default.ModuleKind.System:
            throw new TypeError('Do not support system kind module');
    }
}
function createSourcemapOption(options) {
    return options.sourceMap !== false
        ? options.inlineSourceMap
            ? 'inline'
            : true
        : options.inlineSourceMap
            ? 'inline'
            : false;
}
function tsCompilerOptionsToSwcConfig(options) {
    var _a, _b, _c, _d, _e, _f;
    return {
        target: toTsTarget((_a = options.target) !== null && _a !== void 0 ? _a : typescript_1.default.ScriptTarget.ES2018),
        module: toModule((_b = options.module) !== null && _b !== void 0 ? _b : typescript_1.default.ModuleKind.ES2015),
        sourcemap: createSourcemapOption(options),
        jsx: Boolean(options.jsx),
        react: options.jsxFactory || options.jsxFragmentFactory || options.jsx || options.jsxImportSource
            ? {
                pragma: options.jsxFactory,
                pragmaFrag: options.jsxFragmentFactory,
                importSource: options.jsxImportSource,
                runtime: ((_c = options.jsx) !== null && _c !== void 0 ? _c : 0) >= typescript_1.default.JsxEmit.ReactJSX ? 'automatic' : 'classic',
            }
            : undefined,
        experimentalDecorators: (_d = options.experimentalDecorators) !== null && _d !== void 0 ? _d : false,
        emitDecoratorMetadata: (_e = options.emitDecoratorMetadata) !== null && _e !== void 0 ? _e : false,
        dynamicImport: true,
        esModuleInterop: (_f = options.esModuleInterop) !== null && _f !== void 0 ? _f : false,
        keepClassNames: true,
        paths: options.paths,
    };
}
