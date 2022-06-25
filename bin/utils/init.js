"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const process_1 = require("process");
const copyIfNotExists = (filePath) => {
    const internalPath = (0, path_1.join)(__dirname, "../../", filePath);
    const externalPath = (0, path_1.join)((0, process_1.cwd)(), filePath);
    if (!(0, fs_1.existsSync)(externalPath)) {
        (0, fs_1.copyFileSync)(internalPath, externalPath);
    }
};
const init = () => {
    copyIfNotExists("./pkg.config.json");
    copyIfNotExists("./app.ico");
};
exports.init = init;
