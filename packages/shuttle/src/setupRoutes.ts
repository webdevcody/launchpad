import fs from "fs";
import path from "path";
import { Request, Response, type Express } from "express";
import { Inject, InjectionKey } from ".";

const methods = ["get", "post", "patch", "delete", "put", "options", "head"];

function traverseDirectory(dir: string, onFile: (filePath: string) => void) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      fs.stat(filePath, (err, stat) => {
        if (err) {
          console.error(err);
          return;
        }

        if (stat.isDirectory()) {
          traverseDirectory(filePath, onFile);
        } else {
          onFile(filePath);
        }
      });
    });
  });
}

export async function setupRoutes(app: Express, inject: Inject) {
  console.log(`Registering Routes:`);

  traverseDirectory("src/routes", async (filePath) => {
    const basename = path.basename(filePath);
    const name = path.parse(basename).name;
    const route = filePath
      .replace("src/routes", "")
      .replace(`/${basename}`, "");

    if (!methods.includes(name)) {
      console.error(
        `ERROR: could not register route ${route} due to an invalid http method name of ${name}`
      );
      return;
    }

    try {
      const handler = await import(path.join(process.cwd(), filePath));
      (app as any)[name](
        route.replace(/\[/g, ":").replace(/\]/g, ""),
        (req: Request, res: Response) => handler.default(inject, req, res)
      );
      console.log(` ✅ ${name.toUpperCase()}@${route} => ${filePath}`);
    } catch (err) {
      console.error(` ❌ ${name.toUpperCase()}@${route} => ${filePath}`);
    }
  });
}
