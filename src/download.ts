import fs from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "path";

import { Readable } from 'stream';
import { finished } from 'stream/promises';


const downloadFile = (async (url: string, destination: string) => {
  const res = await fetch(url);
  if (!fs.existsSync(path.dirname(destination))) await mkdir(path.dirname(destination), { recursive: true }); //Optional if you already have downloads directory
  const fileStream = fs.createWriteStream(destination, { flags: 'wx' });
  await finished(Readable.fromWeb(res.body as any).pipe(fileStream));
});


fetch("https://launcher.civalia.fr/build/distribution.json").then(response => response.json()).then(({ resources }) => {

    for (let file of resources) {
        const filePath = path.relative("https://launcher.civalia.fr", file.artifact.url)

        downloadFile(file.artifact.url, path.join("public", filePath))
    }
})