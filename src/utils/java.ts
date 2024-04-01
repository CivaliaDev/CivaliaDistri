import AdmZip from "adm-zip";
import fs from "node:fs";
import path from "node:path";
import checksum from "./checksum.js";
import { env } from "./env.js";
import { runtimesDir } from "./paths.js";
import { javaInfoSchema } from "./schemas.js";

export const infoFilePath = path.join("public", "java_info.json")

export async function readJavaInfoFile() {
  const rawContent = await fs.promises.readFile(infoFilePath, "utf-8")

  const data = javaInfoSchema.parse(JSON.parse(rawContent))

  return data
}

export async function compressJava() {
  if (fs.existsSync(infoFilePath)) {
    try {
      const data = await readJavaInfoFile()

      if (data.size == await getJavaSize()) return
    } catch {
      await fs.promises.rm(infoFilePath)
    }
  }

  const javaPath = env.JAVA;

  if (!fs.existsSync(javaPath)) throw new Error("Java folder not found");

  const folderName = path.basename(javaPath.replace("bin", ""));
  const archiveDestination = path.join(runtimesDir(), folderName + ".zip");

  const zip = new AdmZip();

  await zip.addLocalFolderPromise(javaPath, {})

  await zip.writeZipPromise(archiveDestination)

  await fs.promises.writeFile(infoFilePath, JSON.stringify(
    {
      "path": archiveDestination,
      "size": await getJavaSize(),
      "checksum": await checksum(archiveDestination)
    },
    null, 2))
}

export async function getJavaSize() {
  const files = await fs.promises.readdir(env.JAVA, { recursive: true });

  let size = 0

  for (let file of files) {
    const stat = await fs.promises.stat(path.join(env.JAVA, file))

    if (stat.isDirectory()) continue

    size += stat.size
  }

  return size;
}