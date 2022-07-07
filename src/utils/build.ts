import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { exec } from "pkg";
import { need } from "pkg-fetch";
import { Data, NtExecutable, NtExecutableResource, Resource } from "resedit";

export interface Config {
	file: string;
	icon: string;
	name: string;
	description: string;
	company: string;
	version: string;
	copyright: string;
	pkg: {
		targets: string[];
		outputPath: string;
		assets: string[];
		cache?: string;
		compression?: string;
	};
}

export const parseTarget = (targetStr: string) => {
	const targetOpts = targetStr.split("-");
	return {
		nodeRange: targetOpts[0],
		platform: targetOpts[1],
		arch: targetOpts[2],
	};
};

export const patchWinExe = (exePath: string, config: Config) => {
	const { icon, version, description, company, name, copyright } = config;

	console.log("> Read EXE");

	const data = readFileSync(exePath);
	const exe = NtExecutable.from(data);
	const res = NtExecutableResource.from(exe);
	const viList = Resource.VersionInfo.fromEntries(res.entries);

	let vi = viList[0];
	const theversion = `${version}.0`.split(".");

	vi.removeStringValue({ lang: 1033, codepage: 1200 }, "OriginalFilename");
	vi.removeStringValue({ lang: 1033, codepage: 1200 }, "InternalName");

	console.log("> Set Product Version");

	vi.setProductVersion(
		Number(theversion[0]),
		Number(theversion[1]),
		Number(theversion[2]),
		Number(theversion[3]),
		1033
	);

	console.log("> Set File Version");

	vi.setFileVersion(
		Number(theversion[0]),
		Number(theversion[1]),
		Number(theversion[2]),
		Number(theversion[3]),
		1033
	);

	console.log("> Set File Info");

	vi.setStringValues(
		{ lang: 1033, codepage: 1200 },
		{
			FileDescription: description,
			ProductName: name,
			CompanyName: company,
			LegalCopyright: copyright,
		}
	);

	vi.outputToResourceEntries(res.entries);

	console.log("> Set Icon");

	let iconPath = join(process.cwd(), icon);

	if (!existsSync(iconPath)) {
		iconPath = join(__dirname, "../../", "./app.ico");
	}

	const iconFile = Data.IconFile.from(readFileSync(iconPath));
	Resource.IconGroupEntry.replaceIconsForResource(
		res.entries,
		1,
		1033,
		iconFile.icons.map(item => item.data)
	);
	res.outputResource(exe);

	console.log("> Generate EXE");

	const newBinary = exe.generate();

	console.log("> Save EXE");

	const builtPath = exePath.replace("fetched", "built");
	writeFileSync(builtPath, Buffer.from(newBinary));
};

export const build = async (configFilePath: string) => {
	const configRaw = readFileSync(configFilePath, "utf8");
	const config: Config = JSON.parse(configRaw);

	const { pkg, file } = config;

	const targets = pkg.targets.filter(
		target => parseTarget(target).platform.substring(0, 3) === "win"
	);

	console.log("> Download Binaries");

	for (const t of targets) {
		const target = parseTarget(t);

		const fetchedPath = await need({
			nodeRange: target.nodeRange,
			platform: target.platform,
			arch: target.arch,
			forceBuild: false,
			forceFetch: true,
			dryRun: false,
		});

		patchWinExe(fetchedPath, config);
	}

	console.log("> Bundling App");

	const checkCompression = (str: string | undefined) =>
		str?.toLowerCase() === "gzip" || str?.toLowerCase() === "brotli";

	await exec([
		"--build",
		"--compress",
		...(checkCompression(config.pkg.compression)
			? [config.pkg.compression!]
			: []),
		"--config",
		`${configFilePath}`,
		`${file}`,
	]);
};
