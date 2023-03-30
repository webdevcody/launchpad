import { Request, Response } from "express";
import { ShuttleHandler } from "shuttle";
import { Env } from "../../..";

export const handler: ShuttleHandler<Env> = async (
  { env },
  req: Request,
  res: Response
) => {
  const todoId = req.params.id;
  res.json([
    {
      todoId,
      message: env.MY_ENV,
    },
  ]);
};

export default handler;
