const argv = require('yargs').argv;
const path = require("path");
const fs = require("fs-extra");
const AssetsManager = require("./manager/assetsmanager.js");
const ConfigManager = require("./manager/configmanager.js");
const EnvManager = require("./manager/envmanager.js");
const DistroManager = require("./manager/distromanager.js");

ConfigManager.loadFolder();
let forge = EnvManager.getForge();

const url_forge = `https://maven.minecraftforge.net/net/minecraftforge/forge/${forge}/forge-${forge}-installer.jar`;

async function generateDistro(){
    await AssetsManager.verifyBuild();
    await AssetsManager.creerStructureDossiers();

    if(fs.existsSync(EnvManager.getBuild + "distribution.json")){
        fs.removeSync(EnvManager.getBuild + "distribution.json");
    }

    await DistroManager.generateDistro();
}

if (argv.install) {
    console.log("Installation...");
    AssetsManager.verifyInstall();
}else if (argv.generate){
    generateDistro();
} else {
    console.log("Commande non reconnue.");
}