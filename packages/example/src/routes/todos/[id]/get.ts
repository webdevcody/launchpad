import { Request, Response } from "express";
import { GetTodoKey, ShuttleHandler } from "../../..";

export const handler: ShuttleHandler = async (
  { logger, inject, env },
  req: Request,
  res: Response
) => {
  const todoId = req.params.id;
  const getTodo = inject(GetTodoKey);
  logger.info("info not implmemented yet", env.NODE_ENV);
  const todo = await getTodo(todoId);
  res.json(todo);
};

export default handler;
