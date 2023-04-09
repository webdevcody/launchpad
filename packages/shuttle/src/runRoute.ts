// @ts-ignore

import path from "path";
import { Request, Response, type Express } from "express";
import { Logger } from "winston";
import { v4 as uuid } from "uuid";
import { ZodError } from "zod";
import { getDirectoryTree, Node } from "./getDirectoryTree";

type MatchingPath = {
  path: string;
  params: { [key: string]: string };
};

export function mapRouteToFile(
  baseUrl: string,
  method: string,
  extension: string,
  directoryTree: Node
) {
  function getMatchingFilePath(node: Node): MatchingPath | null {
    if (node.children.length === 0) {
      const fullPathRegex = new RegExp(
        node.path.replace(".ts", "").replace(/\[[a-z0-9]+\]/, "([a-z0-9]+)")
      );
      const matches = fullPathRegex.exec(
        `src/routes${baseUrl}/${method}${extension}`
      );
      if (matches) {
        const paramsWithValues: Record<string, string> = {};
        for (let i = 1; i < matches.length; i++) {
          const key = node.path.match(/\[([a-z0-9]+)\]/g)[i - 1].slice(1, -1);
          paramsWithValues[key] = matches[i];
        }
        return { path: node.path, params: { ...paramsWithValues } };
      } else {
        return null;
      }
    } else {
      for (let child of node.children) {
        const foundPath = getMatchingFilePath(child);
        if (foundPath) return foundPath;
      }
      return null;
    }
  }

  return getMatchingFilePath(directoryTree);
}

export async function runRoute<E, P>(
  app: Express,
  providers: P,
  logger: Logger,
  env: E,
  req: Request,
  res: Response
) {
  const method = req.method.toLowerCase();

  const directoryTree = getDirectoryTree("src/routes");

  console.log(JSON.stringify(directoryTree, null, 2));

  if (!directoryTree) {
    return res.status(404).send("endpoint does not exist");
  }

  const endpointPath = mapRouteToFile(
    req.baseUrl,
    method,
    env.IS_LAMBDA ? ".js" : ".ts",
    directoryTree
  );

  console.log("endpointPath!!", endpointPath);

  if (!endpointPath) {
    return res.status(404).send("endpoint does not exist");
  }

  try {
    let handler: any = await import(
      path.join(process.cwd(), endpointPath.path)
    );
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
      .then(() => {
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
  } catch (err: unknown) {
    let message = "something went wrong";
    if (err instanceof Error) {
      message = err.message;
    }
    res.status(500).send(message);
  }
}
