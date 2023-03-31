import { Request, Response } from "express";
import { AddTodosKey, ShuttleHandler } from "../..";

export const handler: ShuttleHandler = async (
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
