import { Request, Response } from "express";
import { type ShuttleHandler } from "@webdevcody/shuttle";
import { Env, ExampleKey } from "../..";

export const handler: ShuttleHandler<Env> = async (
  { inject },
  req: Request,
  res: Response
) => {
  const message = inject(ExampleKey);
  res.json({
    message,
  });
};

export default handler;
