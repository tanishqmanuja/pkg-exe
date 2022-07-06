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
exports.build = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const pkg_1 = require("pkg");
const pkg_fetch_1 = require("pkg-fetch");
const resedit_1 = require("resedit");
const build = (configFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    const configRaw = (0, fs_1.readFileSync)(configFilePath, "utf8");
    const config = JSON.parse(configRaw);
    const { pkg, icon, version, description, company, name, copyright, file } = config;
    const targets = pkg.targets[0].split("-");
    console.log("> Download Binaries");
    const fetchedPath = yield (0, pkg_fetch_1.need)({
        nodeRange: targets[0],
        platform: targets[1],
        arch: targets[2],
        forceBuild: false,
        forceFetch: true,
        dryRun: false,
    });
    console.log("> Read EXE");
    const data = (0, fs_1.readFileSync)(fetchedPath);
    const exe = resedit_1.NtExecutable.from(data);
    const res = resedit_1.NtExecutableResource.from(exe);
    const viList = resedit_1.Resource.VersionInfo.fromEntries(res.entries);
    let vi = viList[0];
    const theversion = `${version}.0`.split(".");
    vi.removeStringValue({ lang: 1033, codepage: 1200 }, "OriginalFilename");
    vi.removeStringValue({ lang: 1033, codepage: 1200 }, "InternalName");
    console.log("> Set Product Version");
    vi.setProductVersion(Number(theversion[0]), Number(theversion[1]), Number(theversion[2]), Number(theversion[3]), 1033);
    console.log("> Set File Version");
    vi.setFileVersion(Number(theversion[0]), Number(theversion[1]), Number(theversion[2]), Number(theversion[3]), 1033);
    console.log("> Set File Info");
    vi.setStringValues({ lang: 1033, codepage: 1200 }, {
        FileDescription: description,
        ProductName: name,
        CompanyName: company,
        LegalCopyright: copyright,
    });
    vi.outputToResourceEntries(res.entries);
    console.log("> Set Icon");
    let iconPath = (0, path_1.join)(process.cwd(), icon);
    if (!(0, fs_1.existsSync)(iconPath)) {
        iconPath = (0, path_1.join)(__dirname, "../../", "./app.ico");
    }
    const iconFile = resedit_1.Data.IconFile.from((0, fs_1.readFileSync)(iconPath));
    resedit_1.Resource.IconGroupEntry.replaceIconsForResource(res.entries, 1, 1033, iconFile.icons.map(item => item.data));
    res.outputResource(exe);
    console.log("> Generate EXE");
    const newBinary = exe.generate();
    console.log("> Save EXE");
    const builtPath = fetchedPath.replace("fetched", "built");
    (0, fs_1.writeFileSync)(builtPath, Buffer.from(newBinary));
    console.log("> Bundling App");
    const checkCompression = (str) => (str === null || str === void 0 ? void 0 : str.toLowerCase()) === "gzip" || (str === null || str === void 0 ? void 0 : str.toLowerCase()) === "brotli";
    yield (0, pkg_1.exec)([
        "--build",
        "--compress",
        ...(checkCompression(config.pkg.compression)
            ? [config.pkg.compression]
            : []),
        "--config",
        `${configFilePath}`,
        `${file}`,
    ]);
});
exports.build = build;
