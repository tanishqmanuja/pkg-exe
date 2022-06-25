import { copyFileSync, existsSync } from "fs";
import { join } from "path";
import { cwd } from "process";

const copyIfNotExists = (filePath: string) => {
	const internalPath = join(__dirname, "../../", filePath);
	const externalPath = join(cwd(), filePath);
	if (!existsSync(externalPath)) {
		copyFileSync(internalPath, externalPath);
	}
};

export const init = () => {
	copyIfNotExists("./pkg.config.json");
	copyIfNotExists("./app.ico");
};
