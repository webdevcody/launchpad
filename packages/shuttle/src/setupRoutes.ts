// @ts-ignore

import fs from "fs";
import path from "path";
import { Request, Response, type Express } from "express";
import { Logger } from "winston";
import { v4 as uuid } from "uuid";
import { ZodError } from "zod";
import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();

export async function runRoute<E, P>(
  app: Express,
  providers: P,
  logger: Logger,
  env: E,
  req: Request,
  res: Response
) {
  const parts = req.baseUrl.replace(/^\//, "").split("/");
  const method = req.method.toLowerCase();

  const endpointPath = `src/routes/${parts[0]}/${method}${
    env.IS_LAMBDA ? ".js" : ".ts"
  }`;

  if (!fs.existsSync(endpointPath)) {
    return res.status(404).send("endpoint does not exist");
  }

  try {
    let handler: any = await import(path.join(process.cwd(), endpointPath));
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
      .default({ providers, logger, env }, req, res)
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
