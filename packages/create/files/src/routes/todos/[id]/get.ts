import { ShuttleHandler } from "../../..";

const handler: ShuttleHandler = async ({ env }, req, res) => {
  const todoId = req.params.id;
  res.json([
    {
      todoId,
      message: env.MY_ENV,
    },
  ]);
};

export default handler;
