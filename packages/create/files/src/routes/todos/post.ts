import { Request, Response } from "express";
import { ExampleKey, ShuttleHandler } from "../..";

export const handler: ShuttleHandler = async (
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
