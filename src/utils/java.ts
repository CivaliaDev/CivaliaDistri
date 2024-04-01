import AdmZip from "adm-zip";
import fs from "node:fs";
import path from "node:path";
import { env } from "./env.js";
import { runtimesDir } from "./paths.js";

export async function compressJava() {
  const javaPath = env.JAVA;

  if (!fs.existsSync(javaPath)) throw new Error("Java folder not found");

  const folderName = path.basename(javaPath.replace("bin", ""));
  const archiveDestination = path.join(runtimesDir(), folderName + ".zip");

  const zip = new AdmZip();

  await zip.addLocalFolderPromise(javaPath, {})

  await zip.writeZipPromise(archiveDestination)
}

export async function getJavaSize() {
  const files = await fs.promises.readdir(env.JAVA, { recursive: true });

  let size = 0

  for (let file of files) {
    const stat = await fs.promises.stat(path.join(env.JAVA, file))

    size += stat.size
  }

  return size;
}