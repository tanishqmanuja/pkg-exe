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
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const path_1 = require("path");
const process_1 = require("process");
const build_1 = require("../utils/build");
const main = (opts) => __awaiter(void 0, void 0, void 0, function* () {
    const configFilePath = (0, path_1.join)((0, process_1.cwd)(), opts.config);
    yield (0, build_1.build)(configFilePath);
});
const cli = new commander_1.Command();
cli
    .option("-c, --config <filepath>", "build using config file", "pkg.config.json")
    .parse();
main(cli.opts());
