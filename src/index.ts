#!/usr/bin/env node

import { join } from "path";
import { cwd } from "process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { build } from "./utils/build";
import { init } from "./utils/init";

const main = async (argv: any) => {
	if (argv.hasOwnProperty("init")) {
		try {
			init();
			console.log("--> Initialized successfully");
		} catch (error) {
			console.log("--> initialization Failed");
		}
	}

	if (argv.hasOwnProperty("build")) {
		console.log("--> Starting Build");
		try {
			await build(join(cwd(), argv.config));
			console.log("--> Build Successful");
		} catch (error) {
			console.log("--> Build Failed");
		}
	}
};

const argv: any = yargs(hideBin(process.argv)).option({
	init: { alias: "i" },
	build: { alias: "b" },
	config: { type: "string", alias: "c", default: "./pkg.config.json" },
}).argv;

main(argv);
