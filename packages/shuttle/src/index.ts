import express, { Request, Response } from "express";
import { setupRoutes } from "./setupRoutes";
import winston, { Logger } from "winston";
const { format } = winston;
import { cleanEnv, ValidatorSpec, str, port } from "envalid";
import dotenv from "dotenv";
dotenv.config();

type EnvValidators = {
  str: typeof str;
  port: typeof port;
};

const LOG_LEVELS = [
  "error",
  "warn",
  "info",
  "http",
  "verbose",
  "debug",
  "silly",
] as const;

type Options<T> = {
  providers?: (provide: (key: Symbol, value: any) => void) => void;
  env?: (validators: EnvValidators) => {
    [K in keyof T]: ValidatorSpec<T[K]>;
  };
};

export interface InjectionKey<T> extends Symbol {}

const providers = new Map<Symbol, any>();

export default function app<T>(options: Options<T> = {}) {
  const env = cleanEnv(process.env, {
    ...(options.env?.({ str, port }) ?? {}),
    LOG_LEVEL: str({
      choices: LOG_LEVELS,
    }),
    NODE_ENV: str({
      choices: ["development", "test", "production", "staging"],
    }),
    PORT: port(),
  });
  const app = express();

  const logger = winston.createLogger({
    level: env.LOG_LEVEL,
    transports: [
      new winston.transports.Console({
        format: format.combine(
          format.json(),
          format.prettyPrint(),
          format.colorize({ all: true })
        ),
      }),
    ],
  });

  app.use(express.json());

  options.providers?.((key: Symbol, value: any) => {
    providers.set(key, value);
  });

  console.log(`LaunchPad listening on port ${env.PORT}`);

  setupRoutes(app, (key: InjectionKey<any>) => providers.get(key), logger, env);

  app.listen(env.PORT);

  const handler: ShuttleHandler<T & typeof env> = async (context, req, res) => {
    return;
  };

  return { env, handler };
}

export type Inject = <T>(key: InjectionKey<T>) => T;

export type ShuttleContext<E> = {
  inject: Inject;
  logger: Logger;
  env: E;
};

// type PropType<T, K extends "env"> = K extends keyof T ? T[K] : never;

// type Env = PropType<ReturnType<typeof app>, "env">;

export type ShuttleHandler<E> = (
  context: ShuttleContext<E>,
  req: Request,
  res: Response
) => Promise<void>;
