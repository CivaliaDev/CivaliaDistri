const fs = require('fs-extra');
const ConfigManager = require("./configmanager.js");
const EnvManager = require("./envmanager.js");

exports.verifyInstall = function(){
    
}

exports.verifyBuild = function(){
    if(!fs.existsSync(EnvManager.getBuild())){
        fs.mkdirSync(EnvManager.getBuild());
    }
}

exports.creerDossiersRecursif = async function(objet, cheminActuel = EnvManager.getRoot()) {
  for (const [nomDossier, contenu] of Object.entries(objet)) {
    const cheminComplet = cheminActuel + '/' + nomDossier;

    try {
      // Vérifier si le dossier existe déjà avant de le créer
      if (!await dossierExiste(cheminComplet)) {
        await fs.mkdir(cheminComplet);
        console.log(`Dossier créé : ${cheminComplet}`);
      }
    } catch (erreur) {
      console.error(`Erreur lors de la création du dossier ${cheminComplet} :`, erreur);
    }

    if (typeof contenu === 'object' && contenu !== null) {
      await exports.creerDossiersRecursif(contenu, cheminComplet);
    }
  }
}

async function dossierExiste(chemin) {
  try {
    await fs.access(chemin);
    return true; // Le dossier existe
  } catch (erreur) {
    return false; // Le dossier n'existe pas
  }
}

exports.creerStructureDossiers = async function() {
  await exports.creerDossiersRecursif(exports.getFolderJson());
}

exports.getFolderJson = function(){
  return JSON.parse(fs.readFileSync(ConfigManager.getFolderJson()));
}

exports.getDistro = function(){
  return EnvManager.getRoot() + "/distro/";
}