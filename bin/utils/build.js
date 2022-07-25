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
exports.build = exports.patchWinExe = exports.isTargetWindows = exports.parseTarget = void 0;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const hidefile_1 = require("hidefile");
const path_1 = require("path");
const pkg_1 = require("pkg");
const pkg_fetch_1 = require("pkg-fetch");
const process_1 = require("process");
const resedit_1 = require("resedit");
const parseTarget = (targetStr) => {
    const targetOpts = targetStr.split("-");
    return {
        nodeRange: targetOpts[0],
        platform: targetOpts[1],
        arch: targetOpts[2],
    };
};
exports.parseTarget = parseTarget;
const isTargetWindows = (target) => {
    return target.platform.startsWith("win");
};
exports.isTargetWindows = isTargetWindows;
const patchWinExe = (exePath, config) => {
    const { icon, version, description, company, name, copyright } = config;
    console.log("> Read EXE");
    const data = (0, fs_1.readFileSync)(exePath);
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
    const builtPath = exePath.replace("fetched", "built");
    (0, fs_1.writeFileSync)(builtPath, Buffer.from(newBinary));
};
exports.patchWinExe = patchWinExe;
const build = (configFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    const configRaw = (0, fs_1.readFileSync)(configFilePath, "utf8");
    const config = JSON.parse(configRaw);
    const { pkg, file } = config;
    const winConfigFilePath = (0, path_1.join)((0, process_1.cwd)(), "win.temp.config.json");
    const nonWinConfigFilePath = (0, path_1.join)((0, process_1.cwd)(), "nonwin.temp.config.json");
    const winTargets = pkg.targets.filter(t => (0, exports.isTargetWindows)((0, exports.parseTarget)(t)));
    const nonWinTargets = pkg.targets.filter(t => !(0, exports.isTargetWindows)((0, exports.parseTarget)(t)));
    console.log("> Download Binaries");
    for (const t of pkg.targets) {
        const target = (0, exports.parseTarget)(t);
        const fetchedPath = yield (0, pkg_fetch_1.need)({
            nodeRange: target.nodeRange,
            platform: target.platform,
            arch: target.arch,
            forceBuild: false,
            forceFetch: true,
            dryRun: false,
        });
        if ((0, exports.isTargetWindows)(target)) {
            (0, exports.patchWinExe)(fetchedPath, config);
        }
    }
    console.log("> Bundling App");
    const checkCompression = (str) => (str === null || str === void 0 ? void 0 : str.toLowerCase()) === "gzip" || (str === null || str === void 0 ? void 0 : str.toLowerCase()) === "brotli";
    if (winTargets.length > 0) {
        (0, fs_1.writeFileSync)(winConfigFilePath, JSON.stringify({
            name: config.name,
            pkg: Object.assign(Object.assign({}, config.pkg), { targets: winTargets }),
        }));
        const winConfigHiddenFilePath = (0, hidefile_1.hideSync)(winConfigFilePath);
        yield (0, pkg_1.exec)([
            "--build",
            "--compress",
            ...(checkCompression(config.pkg.compression)
                ? [config.pkg.compression]
                : []),
            "--config",
            `${winConfigHiddenFilePath}`,
            `${file}`,
        ]);
        yield (0, promises_1.rm)(winConfigHiddenFilePath, { recursive: true, force: true });
    }
    if (nonWinTargets.length > 0) {
        (0, fs_1.writeFileSync)(nonWinConfigFilePath, JSON.stringify({
            name: config.name,
            pkg: Object.assign(Object.assign({}, config.pkg), { targets: nonWinTargets }),
        }));
        const nonWinConfigHiddenFilePath = (0, hidefile_1.hideSync)(nonWinConfigFilePath);
        yield (0, pkg_1.exec)([
            "--compress",
            ...(checkCompression(config.pkg.compression)
                ? [config.pkg.compression]
                : []),
            "--config",
            `${nonWinConfigHiddenFilePath}`,
            `${file}`,
        ]);
        yield (0, promises_1.rm)(nonWinConfigHiddenFilePath, { recursive: true, force: true });
    }
});
exports.build = build;
