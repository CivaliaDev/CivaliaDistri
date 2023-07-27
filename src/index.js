const fs = require('fs-extra');
const argv = require('yargs').argv;
const AssetsManager = require("./manager/assetsmanager.js");
const ConfigManager = require("./manager/configmanager.js");
require("./util/preload.js");

const url_forge = `https://maven.minecraftforge.net/net/minecraftforge/forge/${forge}/forge-${forge}-installer.jar`;

if (argv.install) {
    console.log("Installation...");
    AssetsManager.verifyInstall();
} else {
    console.log("Commande non reconnue.");
}