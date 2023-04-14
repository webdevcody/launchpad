import express, { Request, Response } from "express";
import { runRoute } from "./runRoute";
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

type Options<T, P> = {
  providers: P;
  env?: (validators: EnvValidators) => {
    [K in keyof T]: ValidatorSpec<T[K]>;
  };
};

export default function app<T, P>(appOptions: Options<T, P>) {
  const env = cleanEnv(process.env, {
    ...(appOptions.env?.({
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
    IS_LAMBDA: bool(),
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
      } as any) as any,
    ],
  });

  app.use(express.json());

  app.use("*", function handleRequest(req, res) {
    runRoute(app, appOptions.providers, logger, env, req, res).catch((err) => {
      logger.error("an internal exception occured inside of shuttle", err);
      res.status(500).send("something bad happened");
    });
  });

  if (!env.IS_LAMBDA) {
    app.listen(env.PORT);
    console.log(`LaunchPad listening on port ${env.PORT}`);
  }

  type CombinedEnv = typeof env;

  function createHandler<I extends ZodTypeAny, O extends ZodTypeAny>(
    options: CreateHandlerOptions<I, O, CombinedEnv, P>
  ) {
    return async function wrappedHandler(
      { logger, env: CombinedEnv }: ShuttleContext<CombinedEnv>,
      params: object,
      req: Request,
      res: Response
    ) {
      const requestPayload = {
        ...req.body,
        ...req.query,
        ...params,
      };
      const input = options.input?.(z)?.parse(requestPayload) ?? requestPayload;

      const result = await options.handler({
        input,
        providers: appOptions.providers,
        logger,
        env,
      });

      const output = options.output?.(z).parse(result) ?? result;

      res.json(output);
    };
  }

  return { env, createHandler, app };
}

export type ShuttleContext<E> = {
  logger: Logger;
  env: E;
};

export type ShuttleHandler<E> = (
  context: ShuttleContext<E>,
  req: Request,
  res: Response
) => Promise<void>;

type CreateHandlerOptions<I extends ZodTypeAny, O extends ZodTypeAny, E, P> = {
  input?: (validate: typeof z) => I;
  output?: (validate: typeof z) => O;
  handler: (
    handlerOptions: { input: z.infer<I>; providers: P } & ShuttleContext<E>
  ) => Promise<z.infer<O>>;
};
