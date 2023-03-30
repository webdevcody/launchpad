import { Request, Response } from "express";
import { type ShuttleHandler } from "@webdevcody/shuttle";
import { Env, ExampleKey } from "../..";

export const handler: ShuttleHandler<Env> = async (
  { inject, logger },
  req: Request,
  res: Response
) => {
  logger.info("getting todos");
  const message = inject(ExampleKey);
  res.json([
    {
      message,
    },
  ]);
};

export default handler;
