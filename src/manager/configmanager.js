const path = require("path");
const fs = require("fs-extra");
const EnvManager = require("./envmanager.js");

const root = EnvManager.getRoot();
const configPath = path.join(root, "src", "config");

exports.getConfigPath = function(){
    return configPath;
}

const folderJson = path.join(configPath, "folder.json");
const firstlaunch = !fs.existsSync(folderJson);

const DEFAULT_CONFIGFOLDER = {
    forge: {
        required: "",
        optional: ""
    },
    runtimes: {},
    instances: {},
    files: {}
}

let configFolder = null;

exports.saveFolder = function() {
    fs.writeFileSync(folderJson, JSON.stringify(configFolder, null, 4));
}

exports.getFolderJson = function(){
    return folderJson;
}

exports.loadFolder = function() {
    console.log('Loading configs..');
    let doLoad = true;

    if(!fs.existsSync(folderJson)) {
        fs.ensureDirSync(path.join(folderJson, '..'));
        
        doLoad = false;
        configFolder = DEFAULT_CONFIGFOLDER;
        exports.saveFolder();
    }
    if(doLoad) {
        let doValidate = false;
        try {
            configFolder = JSON.parse(fs.readFileSync(folderJson, 'UTF-8'));
            doValidate = true;
        } 
        catch (err) {
            console.error(err);
            console.log('Configuration file contains malformed JSON or is corrupt.');
            console.log('Generating a new configuration file.');

            fs.ensureDirSync(path.join(folderJson, '..'));
            configFolder = DEFAULT_CONFIGFOLDER;
            exports.saveFolder();
        }

        if(doValidate) {
            exports.saveFolder();
        }
    }
    console.log('Successfully loaded.');
}