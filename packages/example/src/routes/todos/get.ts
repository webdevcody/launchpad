import { Request, Response } from 'express';
import { Inject, type ShuttleHandler } from 'shuttle';
import { GetTodosKey } from '../..';

export const handler: ShuttleHandler = async (
  inject: Inject,
  req: Request,
  res: Response
) => {
  const getTodos = inject(GetTodosKey);

  const todos = await getTodos();

  res.json(todos);
};

export default handler;
