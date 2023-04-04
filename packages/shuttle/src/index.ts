import express, { Request, Response } from "express";
import { setupRoutes } from "./setupRoutes";
import winston, { Logger } from "winston";
const { format } = winston;
import {
  cleanEnv,
  ValidatorSpec,
  str,
  port,
  bool,
  url,
  host,
  email,
  json,
  num,
} from "envalid";
import dotenv from "dotenv";
import z, { ZodTypeAny } from "zod";
dotenv.config();

type EnvValidators = {
  str: typeof str;
  port: typeof port;
  bool: typeof bool;
  url: typeof url;
  host: typeof host;
  email: typeof email;
  json: typeof json;
  num: typeof num;
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

interface InjectionKey<T> extends Symbol {}

const providers = new Map<Symbol, any>();

export default function app<T>(options: Options<T>) {
  const env = cleanEnv(process.env, {
    ...(options.env?.({
      str,
      port,
      bool,
      url,
      host,
      email,
      json,
      num,
    }) ??
      ({} as {
        [K in keyof T]: ValidatorSpec<T[K]>;
      })),
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

  type CombinedEnv = typeof env;

  function createHandler<I extends ZodTypeAny, O extends ZodTypeAny>(
    options: CreateHandlerOptions<I, O, CombinedEnv>
  ) {
    return async (
      { inject, logger, env: CombinedEnv }: ShuttleContext<CombinedEnv>,
      req: Request,
      res: Response
    ) => {
      const requestPayload = {
        ...req.body,
        ...req.query,
        ...req.params,
      };
      const input = options.input?.(z)?.parse(requestPayload) ?? requestPayload;

      const result = await options.handler({ input, inject, logger, env });

      const output = options.output?.(z).parse(result) ?? result;

      res.json(output);
    };
  }

  return { env, createHandler };
}

export type Inject = <T>(key: InjectionKey<T>) => T;

export function createInjectionKey<T>(value: T) {
  return Symbol() as InjectionKey<T>;
}

export type ShuttleContext<E> = {
  inject: Inject;
  logger: Logger;
  env: E;
};

export type ShuttleHandler<E> = (
  context: ShuttleContext<E>,
  req: Request,
  res: Response
) => Promise<void>;

type CreateHandlerOptions<I extends ZodTypeAny, O extends ZodTypeAny, E> = {
  input?: (validate: typeof z) => I;
  output?: (validate: typeof z) => O;
  handler: (
    handlerOptions: { input: z.infer<I> } & ShuttleContext<E>
  ) => Promise<z.infer<O>>;
};
