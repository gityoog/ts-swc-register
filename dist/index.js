"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const register_1 = __importDefault(require("./register"));
const source_map_support_1 = __importDefault(require("source-map-support"));
source_map_support_1.default.install({
    hookRequire: true
});
(0, register_1.default)();
