import { Request, Response } from "express";
import { ExampleKey, ShuttleHandler } from "../..";

export const handler: ShuttleHandler = async (
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
