import fs from "fs";
import path from "path";
import { Request, Response, type Express } from "express";
import { Inject, InjectionKey, ShuttleContext, ShuttleHandler } from ".";
import { Logger } from "winston";
import { v4 as uuid } from "uuid";

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

export async function setupRoutes<E>(
  app: Express,
  inject: Inject,
  logger: Logger,
  env: E
) {
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
      const handler: { default: ShuttleHandler<E> } = await import(
        path.join(process.cwd(), filePath)
      );
      const expressRoute: string = route.replace(/\[/g, ":").replace(/\]/g, "");
      (app as any)[name](expressRoute, (req: Request, res: Response) => {
        const requestId = uuid();
        const start = new Date();
        const startMs = Date.now();
        const timeInvoked = start.toISOString();
        const method = name.toUpperCase();
        const logContext = {
          timeInvoked,
          requestId,
          method,
          route,
          filePath,
        };
        logger.info(`request initiated`, {
          ...logContext,
        });
        handler
          .default({ inject, logger, env }, req, res)
          .catch((error: Error) => {
            logger.error(`request errored with ${error.message}`, {
              ...logContext,
              error: error.message,
              errorTrace: error.stack,
            });
          })
          .finally(() => {
            const elaspedTime = Date.now() - startMs;
            logger.info(`request completed`, {
              ...logContext,
              elaspedTime,
            });
          });
      });
      console.log(` ✅ ${name.toUpperCase()}@${route} => ${filePath}`);
    } catch (err) {
      console.error(` ❌ ${name.toUpperCase()}@${route} => ${filePath}`);
    }
  });
}
