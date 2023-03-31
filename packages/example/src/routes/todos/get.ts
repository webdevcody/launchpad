import { GetTodosKey, ShuttleHandler } from "../..";

const handler: ShuttleHandler = async ({ inject, logger }, req, res) => {
  const getTodos = inject(GetTodosKey);
  const todos = await getTodos();
  logger.warn("got some todos");
  logger.info("got some todos");
  logger.error("got some todos");
  res.json(todos);
};

export default handler;
