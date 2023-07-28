const fs = require("fs-extra");
const AssetsManager = require("./assetsmanager.js");
const ConfigManager = require("./configmanager.js");
const EnvManager = require("./envmanager.js");
const path = require("path");
const { type } = require("os");
const AdmZip = require('adm-zip');

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

exports.getDirectorySize = function (dirPath) {
  return new Promise((resolve, reject) => {
    let totalSize = 0;

      function calculateSize(directory) {
          const files = fs.readdirSync(directory);
          
          files.forEach(file => {
              const filePath = path.join(directory, file);
              const stats = fs.statSync(filePath);
      
              if (stats.isFile()) {
                  totalSize += stats.size;
              } else if (stats.isDirectory()) {
                  calculateSize(filePath);
              }
          });
      }

      calculateSize(dirPath);
      resolve(totalSize);
  });
};  

let javaSizeFile;

exports.generateDistro = async function (){
  exports.compileJava().then((size) => {
    javaSizeFile = parseInt(size);
  });
  exports.getFile();
  
}

exports.compressJava = function (dossierACompresser, nomFichierZip){
  if (!fs.existsSync(dossierACompresser)) {
    console.log(`Le dossier '${dossierACompresser}' n'existe pas.`);
    return;
  }

  const zip = new AdmZip();

  function ajouterFichiersAuZip(cheminActuel, cheminArchive) {
      const stat = fs.statSync(cheminActuel);
      if (stat.isFile()) {
          zip.addLocalFile(cheminActuel, cheminArchive);
      } else if (stat.isDirectory()) {
          const fichiers = fs.readdirSync(cheminActuel);
          fichiers.forEach((fichier) => {
              ajouterFichiersAuZip(
                  path.join(cheminActuel, fichier),
                  path.join(cheminArchive, fichier)
              );
          });
      }
  }

  ajouterFichiersAuZip(dossierACompresser, nomFichierZip);

  zip.writeZip(nomFichierZip);
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
        const extension = path.extname(cheminElement);
        // Si c'est un fichier, l'ajouter directement au tableau
        const fileName = String(element).split(`${extension}`).join('');

        // Obtenez juste le nom du dossier "required"
        const folderName = path.basename(path.dirname(cheminElement));

        let typeFM = "";
        let md5_File = "";

        const id_File = String(fileName).toLowerCase().replace(/\s/g, '');
        
        if(folderName == "required"){
          typeFM = "ForgeMod"
        }else if(folderName == "optional"){
          typeFM = "ForgeModOptional"
        }else if(folderName == "runtimes"){
          typeFM = "Java"
        }else if(folderName == "files"){
          typeFM = "RootFile"
        }else if(folderName == "version"){
          typeFM = "ForgeVersion"
        }

        await exports.getMD5(cheminElement).then((md5) => {
          md5_File = md5;
        });

        const fichier = {
          id: id_File,
          nom: fileName,
          chemin: cheminElement, // Ajouter le chemin complet du fichier ici
          type: 'fichier',
          typeFM: typeFM,
          extension: extension,
          md5: md5_File
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

exports.compileJava = async function(){
  const javaSize = exports.getDirectorySize(EnvManager.getJava());
  const folderName = path.basename(path.dirname(EnvManager.getJava()));
  exports.compressJava(EnvManager.getJava(), AssetsManager.getRuntimes() +  folderName + ".zip");
  return javaSize;
}

exports.getFile = function () {
  obtenirStructureDossier(AssetsManager.getDistro()).then(async (structure) => {
    const fichiers = await parcourirFichiers(structure);
    const cheminDossierPrincipal = AssetsManager.getDistro();
    let distribution = [];

    fichiers.map((fichier) => {
      // Prepare Var for insert in JSON
      const cheminFichier = path.join(fichier.chemin);
      let size_File = exports.getSize(cheminFichier);
      const relatifUrlRequired = path.relative(EnvManager.getRoot(), fichier.chemin);
      const url_File = path.join(EnvManager.getBase_url(), relatifUrlRequired).replace(/\\(?!civalia)/gi, '/').replace(/\\/gi, '//');
      if(fichier.typeFM == "Java"){
        size_File = javaSizeFile;
      }
      // Ajoutez chaque objet distribution nouvellement créé dans le tableauc
      distribution.push({
        id: fichier.id,
        name: fichier.nom,
        type: fichier.typeFM,
        artifact: {
          size: size_File,
          url: url_File,
          md5: fichier.md5,
          extension: fichier.extension,
        }
      });
    });
    distribution = JSON.stringify(distribution, null, 2);
    fs.writeFileSync(EnvManager.getBuild() + "/distribution.json", distribution);
  });
}