#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";
import { cwd } from "process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Config } from "./utils/build";
import { init } from "./utils/init";

const main = async (argv: any) => {
	if (argv.hasOwnProperty("init")) {
		try {
			init();
			console.log("> Initialized successfully");
		} catch (error) {
			console.log("> initialization Failed");
		}
	}

	if (argv.hasOwnProperty("build")) {
		console.log("> Starting Build");
		try {
			const configFilePath = join(cwd(), argv.config);
			const configRaw = readFileSync(configFilePath, "utf8");
			const config: Config = JSON.parse(configRaw);

			if (config.pkgcache) {
				process.env.PKG_CACHE_PATH = join(cwd(), config.pkgcache);
			}

			execSync(
				`node \"${join(__dirname, "../bin/libs/build.js")}\" -c ${argv.config}`,
				{
					env: process.env,
					...(argv.debug ? { stdio: "inherit" } : {}),
				}
			);
			console.log("> Build Successful");
		} catch (error) {
			console.log("> Build Failed");
		}
	}
};

const argv: any = yargs(hideBin(process.argv)).option({
	init: { alias: "i" },
	build: { alias: "b" },
	config: { type: "string", alias: "c", default: "./pkg.config.json" },
	debug: { type: "boolean", alias: "d" },
}).argv;

main(argv);
