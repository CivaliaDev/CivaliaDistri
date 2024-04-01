import fs from "node:fs/promises";
import path from "node:path";
import checksum from "./checksum.js";
import { env } from "./env.js";
import { getJavaSize } from "./java.js";
import { Ressource, RessourceType } from "./types.js";

const folderMap = {
    "required": RessourceType.ForgeMod,
    "optional": RessourceType.ForgeModOptional,
    "runtimes": RessourceType.Java,
    "files": RessourceType.RootFile,
    "version": RessourceType.ForgeVersion,
    "ressourcepacks": RessourceType.RessourcePack,
    "shaderpacks": RessourceType.ShaderPack
} as Record<string, RessourceType>

export async function getResources(folder: string) {
    try {
        const elements = await fs.readdir(folder, { recursive: true })
        const files: Ressource[] = []

        for (let element of elements) {
            const elementPath = path.join(folder, element)

            const stat = await fs.stat(elementPath);

            if (stat.isFile() && path.basename(elementPath) !== ".htaccess") {
                const extension = path.extname(elementPath);

                const currentFolder = path.dirname(elementPath).split(path.sep).at(-1)!;
                
                const fileName = path.basename(element.split(`${extension}`).join(''));
                const fileId = fileName.toLowerCase().replace(/\s/g, '');

                const relativeUrlRequired = path.relative(env.ROOT, elementPath);
                const fileUrl = path.join(env.BASE_URL, "distro", relativeUrlRequired).replace(/\\(?!civalia)/gi, '/').replace(/\\/gi, '//');

                const type = folderMap[path.basename(currentFolder)] ?? RessourceType.Unknown;

                const file = {
                    id: fileId,
                    name: fileName,
                    type,
                    artifact: {
                        extension,
                        md5: await checksum(elementPath),
                        size: type == RessourceType.Java ? await getJavaSize() : stat.size,
                        url: fileUrl
                    }
                } satisfies Ressource

                files.push(file)
            }
        }

        return files;
    } catch (e) {
        if (e instanceof Error) {
            console.error("An error occured while trying to read folder structure: ", e.message)
        }

        return []
    }
}