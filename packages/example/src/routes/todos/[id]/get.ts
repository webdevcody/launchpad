import { GetTodoKey, ShuttleHandler } from "../../..";

const handler: ShuttleHandler = async ({ logger, inject, env }, req, res) => {
  const todoId = req.params.id;
  const getTodo = inject(GetTodoKey);
  logger.info("info not implmemented yet", env.NODE_ENV);
  const todo = await getTodo(todoId);
  res.json(todo);
};

export default handler;
