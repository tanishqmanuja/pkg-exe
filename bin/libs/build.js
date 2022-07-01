"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const process_1 = require("process");
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const build_1 = require("../utils/build");
const main = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    const configFilePath = (0, path_1.join)((0, process_1.cwd)(), argv.config);
    yield (0, build_1.build)(configFilePath);
});
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv)).option({
    config: { type: "string", alias: "c", default: "./pkg.config.json" },
}).argv;
main(argv);
