import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import checksum from "./checksum.js";
import { env } from "./env.js";
import { readJavaInfoFile } from "./java.js";
import { Resource, ResourceType } from "./types.js";

const folderMap = {
    "runtimes": ResourceType.Java,
    "forge": {
        "core": {
            "required": ResourceType.ForgeCoreRequired,
            "optional": ResourceType.ForgeCoreOptional,
        },
        "mods": {
            "required": ResourceType.ForgeModRequired,
            "optional": ResourceType.ForgeModOptional,
        },
    },
    "files": ResourceType.RootFile,
    "ressourcepacks": ResourceType.RessourcePack,
    "shaderpacks": ResourceType.ShaderPack,
    "config": ResourceType.ConfigElement
} as Record<string, any>

function formatFolderMap(map: Record<string, any>) {
    const formattedMap: Record<string, ResourceType> = {}

    for (let folder in map) {
        if (typeof map[folder] == "object") {
            const subFolderMap = formatFolderMap(map[folder])
            for (let subFolder in subFolderMap) {
                formattedMap[path.join(folder, subFolder)] = subFolderMap[subFolder]
            }
        } else {
            formattedMap[folder] = map[folder]
        }
    }

    return formattedMap
}

const formattedFolderMap = formatFolderMap(folderMap)

for (let currentFolder in formattedFolderMap) {
    const folderPath = path.join(env.ROOT, currentFolder)

    if (!existsSync(folderPath)) await fs.mkdir(folderPath, { recursive: true })
}

export async function fetchResources(folder: string) {
    try {
        const javaInfo = await readJavaInfoFile()

        const elements = await fs.readdir(folder, { recursive: true })
        const files: Resource[] = []

        for (let element of elements) {
            const elementPath = path.join(folder, element)

            const stat = await fs.stat(elementPath);

            if (stat.isFile() && path.basename(elementPath) !== ".htaccess") {
                const extension = path.extname(elementPath);

                const baseFolder = path.dirname(path.relative(folder, elementPath));

                const fileName = path.basename(element.split(`${extension}`).join(''));
                const fileId = fileName.toLowerCase().replace(/\s/g, '');

                const relativeUrlRequired = path.relative(env.ROOT, elementPath);
                const fileUrl = path.join(env.BASE_URL, "distro", relativeUrlRequired).replace(/\\(?!civalia)/gi, '/').replace(/\\/gi, '//');

                const type = formattedFolderMap[Object.keys(formattedFolderMap).sort((a, b) => b.split(path.sep).length - a.split(path.sep).length).find(p => baseFolder.includes(p))!] ?? ResourceType.Unknown;

                const file = {
                    id: fileId,
                    name: fileName,
                    type,
                    artifact: {
                        extension,
                        md5: await checksum(elementPath),
                        size: type == ResourceType.Java ? javaInfo.size : stat.size,
                        url: fileUrl
                    }
                } satisfies Resource

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

const resourcesCahePath = path.join("public", "cache", "resources.json")

export async function cacheResources(resources: Resource[]) {
    if (!existsSync(resourcesCahePath)) await fs.mkdir(path.dirname(resourcesCahePath), { recursive: true })

    await fs.writeFile(resourcesCahePath, JSON.stringify(resources, null, 2))
}

export async function getResources() {
    try {
        if (!existsSync(resourcesCahePath)) throw new Error("Resources cache not found")

        const rawContent = await fs.readFile(resourcesCahePath, "utf-8")

        const content = JSON.parse(rawContent)

        return content as Resource[]
    } catch {
        const resources = await fetchResources(env.ROOT)

        cacheResources(resources)

        return resources
    }
}