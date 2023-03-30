import { Request, Response } from 'express';
import { Inject, type ShuttleHandler } from 'shuttle';
import { AddTodosKey, GetTodosKey } from '../..';

export const handler: ShuttleHandler = async (
  inject: Inject,
  req: Request,
  res: Response
) => {
  const addTodo = inject(AddTodosKey);

  const todos = await addTodo({
    id: Math.random() + '',
    text: req.body.text,
  });

  res.json(todos);
};

export default handler;
