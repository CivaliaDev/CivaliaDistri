const fs = require("fs-extra");
const AssetsManager = require("./assetsmanager.js");
const ConfigManager = require("./configmanager.js");
const EnvManager = require("./envmanager.js");
const path = require("path");
const { type } = require("os");

exports.getMD5 = function (file) {
  return new Promise((resolve, reject) => {
      const crypto = require('crypto');
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(file);
      stream.on('error', reject);
      stream.on('data', function (chunk) {
          hash.update(chunk);
      });
      stream.on('end', function () {
          resolve(hash.digest('hex'));
      });
  });
}

exports.getSize = function (file) {
    return fs.statSync(file).size;
}

exports.generateDistro = function (){
  exports.getFile();
  
}

async function obtenirStructureDossier(cheminDossier) {
  try {
    const elements = await fs.readdir(cheminDossier);
    const structure = [];

    for (const element of elements) {
      const cheminElement = `${cheminDossier}/${element}`;
      const stat = await fs.stat(cheminElement);

      if (stat.isDirectory()) {
        // Si c'est un sous-dossier, récursion pour obtenir sa structure
        const sousDossier = {
          nom: element,
          type: 'dossier',
          contenu: await obtenirStructureDossier(cheminElement)
        };
        structure.push(sousDossier);
      } else if (stat.isFile()) {
        const extentions = path.extname(cheminElement);
        // Si c'est un fichier, l'ajouter directement au tableau
        const dirname = path.dirname(cheminElement);
        const typeFM = "";

        const id_File = element.toLowerCase().replace(/\s/g, '');

        if(dirname == "required"){
          typeFM = "ForgeMod"
        }else if(dirname == "optional"){
          typeFM = "ForgeModOptional"
        }else if(dirname == "runtimes"){
          typeFM = "Java"
        }else if(dirname == "files"){
          typeFM = "RootFile"
        }

        const fichier = {
          id: id_File,
          nom: element,
          chemin: cheminElement, // Ajouter le chemin complet du fichier ici
          type: 'fichier',
          typeFM: typeFM,
          extention: extentions
        };
        structure.push(fichier);
      }
    }

    return structure;
  } catch (erreur) {
    console.error('Une erreur est survenue lors de la lecture du dossier :', erreur);
    return [];
  }
}

async function parcourirFichiers(structure, cheminActuel = '') {
  const fichiers = [];

  await Promise.all(structure.map(async (element) => {
    if (element.type === 'fichier') {
      // Si c'est un fichier, ajoutez-le à la liste des fichiers
      fichiers.push(element);
      // Vous pouvez ajouter d'autres actions à effectuer avec le fichier ici
    } else if (element.type === 'dossier') {
      // Si c'est un dossier, appelez récursivement pour parcourir ses fichiers
      const sousChemin = cheminActuel + '/' + element.nom;
      const fichiersSousDossier = await parcourirFichiers(element.contenu, sousChemin);
      fichiers.push(...fichiersSousDossier);
    }
  }));

  return fichiers;
}

exports.getFile = function () {
  obtenirStructureDossier(AssetsManager.getDistro()).then(async (structure) => {
    const fichiers = await parcourirFichiers(structure);
    const cheminDossierPrincipal = AssetsManager.getDistro();
    let distribution = [];
    fichiers.map((fichier) => {
      // Prepare Var for insert in JSON
      const cheminFichier = path.join(fichier.chemin);

      let md5_File = "";
      const size_File = exports.getSize(cheminFichier);
      const relatifUrlRequired = path.relative(AssetsManager.getDistro(), fichier.chemin);
      const url_File = path.join(EnvManager.getBase_url(), relatifUrlRequired);
      const extention_File = fichier.extention;

      exports.getMD5(cheminFichier).then((md5) => {
        md5_File = md5;
      });

      console.log(url_File);
      const dossierUp = path.join("/required/");

      distribution += {
        id = 
      }

    });
  });
}

exports.generateFileJson = function () {

}