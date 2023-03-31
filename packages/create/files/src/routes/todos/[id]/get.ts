import { Request, Response } from "express";
import { ShuttleHandler } from "../../..";

export const handler: ShuttleHandler = async (
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
