const fs = require('fs').promises;
const path = require('path');
const StreamZip = require('node-stream-zip');

const AssetsManager = require("./assetsmanager.js");

exports.obtenirStructureDossier = async function(cheminDossier) {
    try {
        const elements = await fs.readdir(cheminDossier);
        const structure = [];

        for (const element of elements) {
            const cheminElement = path.join(cheminDossier, element);
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

                if (extension === '.jar') {
                    // Si c'est un fichier JAR, extraire le mcmod.info
                    const mcmodInfo = await extraireMcModInfo(cheminElement);
                    if (mcmodInfo) {
                        const modInfo = JSON.parse(mcmodInfo);
                        const mod = {
                            id: modInfo.modid,
                            version: modInfo.version,
                            dependencies: modInfo.dependencies || []
                        };
                        structure.push(mod);
                    }
                }
            }
        }

        return structure;
    } catch (erreur) {
        console.error('Une erreur est survenue lors de la lecture du dossier :', erreur);
        return [];
    }
}

async function extraireMcModInfo(cheminJar) {
    return new Promise((resolve, reject) => {
        const zip = new StreamZip({
            file: cheminJar,
            storeEntries: true
        });

        zip.on('ready', () => {
            const mcmodInfoEntry = zip.entry('mcmod.info');

            if (mcmodInfoEntry) {
                const mcmodInfoContent = zip.entryDataSync(mcmodInfoEntry);
                zip.close();
                resolve(mcmodInfoContent.toString('utf8'));
            } else {
                zip.close();
                resolve(null);
            }
        });

        zip.on('error', err => {
            zip.close();
            reject(err);
        });
    });
}