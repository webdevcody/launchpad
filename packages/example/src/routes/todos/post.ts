import { Request, Response } from "express";
import { type ShuttleHandler } from "shuttle";
import { AddTodosKey, Env } from "../..";

export const handler: ShuttleHandler<Env> = async (
  { inject },
  req: Request,
  res: Response
) => {
  const addTodo = inject(AddTodosKey);

  const todos = await addTodo({
    id: Math.random() + "",
    text: req.body.text,
  });

  res.json(todos);
};

export default handler;
