#!/usr/bin/env node

import { execSync } from "child_process";
import { Command } from "commander";
import { readFileSync } from "fs";
import { join } from "path";
import { argv, cwd } from "process";
import { Config } from "./utils/build";
import { init } from "./utils/init";

const cli = new Command();

cli
	.command("init")
	.description("Initialize configuration files")
	.alias("i")
	.action(() => {
		try {
			init();
			console.log("> Initialized successfully");
		} catch (error) {
			console.log("> initialization Failed");
		}
	});

cli
	.command("build")
	.description("Builds an executable file with pkg")
	.alias("b")
	.option("-c, --config <filepath>", "config file to use", "./pkg.config.json")
	.action(args => {
		console.log("> Starting Build");
		try {
			const configFilePath = join(cwd(), args.config);
			const configRaw = readFileSync(configFilePath, "utf8");
			const config: Config = JSON.parse(configRaw);

			if (config.pkg.cache) {
				process.env.PKG_CACHE_PATH = join(cwd(), config.pkg.cache);
			}

			execSync(
				`node \"${join(__dirname, "../bin/cli/build.js")}\" -c ${args.config}`,
				{
					env: process.env,
					...(args.debug ? { stdio: "inherit" } : {}),
				}
			);
			console.log("> Build Successful");
		} catch (error) {
			console.log("> Build Failed");
		}
	});

cli.parse(argv);
