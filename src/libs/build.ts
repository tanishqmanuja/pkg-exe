import { join } from "path";
import { cwd } from "process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { build } from "../utils/build";

const main = async (argv: any) => {
	const configFilePath = join(cwd(), argv.config);
	await build(configFilePath);
};

const argv: any = yargs(hideBin(process.argv)).option({
	config: { type: "string", alias: "c", default: "./pkg.config.json" },
}).argv;

main(argv);
