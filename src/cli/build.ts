import { Command } from "commander";
import { join } from "path";
import { cwd } from "process";
import { build } from "../utils/build";

const main = async (opts: any) => {
	const configFilePath = join(cwd(), opts.config);
	await build(configFilePath);
};

const cli = new Command();

cli
	.option(
		"-c, --config <filepath>",
		"build using config file",
		"pkg.config.json"
	)
	.parse();

main(cli.opts());
