const path = require("path");
const fs = require("fs-extra");
const configPath = path.join(root, "src", "config");

exports.getConfigPath = function(){
    return configPath;
}

const folderJson = path.join(configPath, "folder.json");
const firstlaunch = !fsexistsSync(folderJson);

const DEFAULT_CONFIGFOLDER = {
    forge: {
        required,
        optional
    },
    runtimes: {},
    instances: {},
    files: {}
}

let configFolder = null;

exports.saveFolder = function() {
    fs.writeFileSync(folderJson, JSON.stringify(configFolder, null, 4));
}

exports.loadFolder = function() {
    logger.log('Loading configs..');
    let doLoad = true;

    exports.verifyAllFile();

    if(!fs.existsSync(folderJson)) {
        fs.ensureDirSync(path.join(folderJson, '..'));
        
        doLoad = false;
        configFolder = DEFAULT_CONFIGFOLDER;
        exports.save();
    }
    if(doLoad) {
        let doValidate = false;
        try {
            configFolder = JSON.parse(fs.readFileSync(folderJson, 'UTF-8'));
            doValidate = true;
        } 
        catch (err) {
            logger.error(err);
            logger.log('Configuration file contains malformed JSON or is corrupt.');
            logger.log('Generating a new configuration file.');

            fs.ensureDirSync(path.join(folderJson, '..'));
            configFolder = DEFAULT_CONFIGFOLDER;
            exports.save();
        }

        if(doValidate) {
            configFolder = validateKeySet(DEFAULT_CONFIG, configFolder);
            exports.save();
        }
    }
    logger.log('Successfully loaded.');
}