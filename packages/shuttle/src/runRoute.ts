// @ts-ignore

import path from "path";
import { Request, Response, type Express } from "express";
import { Logger } from "winston";
import { v4 as uuid } from "uuid";
import { ZodError } from "zod";
import { getHandlerFiles } from "./getHandlerFiles";

export function mapRouteToFile(
  baseUrl: string,
  method: string,
  extension: string,
  handlerFiles: string[]
) {
  for (let path of handlerFiles) {
    const fullPathRegex = new RegExp(
      path.replace(/.(t|j)s$/, "").replace(/\[[a-z0-9]+\]/, "([a-z0-9]+)")
    );
    const matches = fullPathRegex.exec(
      `src/routes${baseUrl}/${method}${extension}`
    );
    if (matches) {
      const paramsWithValues: Record<string, string> = {};
      for (let i = 1; i < matches.length; i++) {
        const match = path.match(/\[([a-z0-9]+)\]/g);
        if (!match) continue;
        const key = match[i - 1].slice(1, -1);
        paramsWithValues[key] = matches[i];
      }
      return { path, params: { ...paramsWithValues } };
    }
  }
  return null;
}

export async function runRoute<E extends { IS_LAMBDA: boolean }, P>(
  app: Express,
  providers: P,
  logger: Logger,
  env: E,
  req: Request,
  res: Response
) {
  const method = req.method.toLowerCase();

  const handlerFiles = await getHandlerFiles("src/routes");

  if (!handlerFiles.length) {
    return res.status(404).send("endpoint does not exist");
  }

  const endpointPath = mapRouteToFile(
    req.baseUrl,
    method,
    env.IS_LAMBDA ? ".js" : ".ts",
    handlerFiles
  );

  if (!endpointPath) {
    return res.status(404).send("endpoint does not exist");
  }

  let handler: any = await import(path.join(process.cwd(), endpointPath.path));

  if (env.IS_LAMBDA) {
    handler = handler.default;
  }

  const requestId = uuid();
  const start = new Date();
  const startMs = Date.now();
  const timeInvoked = start.toISOString();
  const methodUppercase = method.toUpperCase();
  const logContext = {
    timeInvoked,
    requestId,
    method: methodUppercase,
    route: endpointPath,
    filePath: endpointPath,
  };

  handler
    .default({ providers, logger, env }, endpointPath.params, req, res)
    .then(function handlerDone() {
      const elaspedTime = Date.now() - startMs;
      logger.info(`request completed`, {
        ...logContext,
        elaspedTime,
      });
    })
    .catch((error: Error) => {
      const elaspedTime = Date.now() - startMs;
      logger.error(`request errored with ${error.message}`, {
        ...logContext,
        error: error.message,
        errorTrace: error.stack,
        elaspedTime,
      });
      if (error instanceof ZodError) {
        res.status(400).send(error.message);
      } else {
        res.status(500).send(error.message);
      }
    });
}
