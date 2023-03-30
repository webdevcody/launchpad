import express, { Request, Response } from "express";
import { setupRoutes } from "./setupRoutes";

type Options = {
  port: number;
  providers: (provide: (key: Symbol, value: any) => void) => void;
};

export interface InjectionKey<T> extends Symbol {}

const providers = new Map<Symbol, any>();

export default function app(options: Options) {
  const app = express();

  app.use(express.json());

  options.providers((key: Symbol, value: any) => {
    providers.set(key, value);
  });

  console.log(`LaunchPad listening on port ${options.port}`);

  setupRoutes(app, (key: InjectionKey<any>) => providers.get(key));

  app.listen(options.port);
}

export type Inject = <T>(key: InjectionKey<T>) => T;

export type ShuttleHandler = (
  inject: Inject,
  req: Request,
  res: Response
) => Promise<void>;
