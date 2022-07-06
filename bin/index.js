#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const commander_1 = require("commander");
const fs_1 = require("fs");
const path_1 = require("path");
const process_1 = require("process");
const init_1 = require("./utils/init");
const cli = new commander_1.Command();
cli
    .command("init")
    .description("Initialize configuration files")
    .alias("i")
    .action(() => {
    try {
        (0, init_1.init)();
        console.log("> Initialized successfully");
    }
    catch (error) {
        console.log("> initialization Failed");
    }
});
cli
    .command("build")
    .description("Builds an executable file with pkg")
    .alias("b")
    .option("-c, --config <filepath>", "config file to use", "./pkg.config.json")
    .option("-d, --debug", "output debug logs")
    .action(args => {
    console.log("> Build Started");
    try {
        const configFilePath = (0, path_1.join)((0, process_1.cwd)(), args.config);
        const configRaw = (0, fs_1.readFileSync)(configFilePath, "utf8");
        const config = JSON.parse(configRaw);
        if (config.pkg.cache) {
            process.env.PKG_CACHE_PATH = (0, path_1.join)((0, process_1.cwd)(), config.pkg.cache);
        }
        (0, child_process_1.execSync)(`node \"${(0, path_1.join)(__dirname, "../bin/cli/build.js")}\" -c ${args.config}`, Object.assign({ env: process.env }, (args.debug ? { stdio: "inherit" } : {})));
        console.log("> Build Successful");
    }
    catch (error) {
        console.log("> Build Failed");
    }
});
cli.parse(process_1.argv);
