import fs from "fs";
import { promisify } from "util";

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export async function getHandlerFiles(directoryPath: string) {
  let files: string[] = [];

  async function helper(helperPath: string) {
    const stats = await stat(helperPath);

    if (!stats.isDirectory()) {
      return files.push(helperPath);
    }

    const contents = await readdir(helperPath);
    await Promise.all(
      contents.map((item: string) => {
        const itemPath = `${helperPath}/${item}`;
        return helper(itemPath);
      })
    );
  }

  await helper(directoryPath);
  return files;
}
