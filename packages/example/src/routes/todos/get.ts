import { Request, Response } from "express";
import { GetTodosKey, ShuttleHandler } from "../..";

export const handler: ShuttleHandler = async (
  { inject, logger },
  req: Request,
  res: Response
) => {
  const getTodos = inject(GetTodosKey);
  const todos = await getTodos();
  logger.warn("got some todos");
  logger.info("got some todos");
  logger.error("got some todos");
  res.json(todos);
};

export default handler;
