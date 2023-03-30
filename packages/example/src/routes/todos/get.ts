import { Request, Response } from "express";
import { type ShuttleHandler } from "shuttle";
import { Env, GetTodosKey } from "../..";

export const handler: ShuttleHandler<Env> = async (
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
