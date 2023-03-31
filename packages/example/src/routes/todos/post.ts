import { AddTodosKey, ShuttleHandler } from "../..";
import { v4 as uuid } from "uuid";

const handler: ShuttleHandler = async ({ inject, z }, req, res) => {
  const inputValidation = z.object({
    text: z.string(),
  });

  const outputValidation = z.object({
    id: z.string(),
    text: z.string(),
  });

  const payload = inputValidation.parse(req.body);

  const addTodo = inject(AddTodosKey);
  const todo = {
    id: uuid(),
    nope: "gg",
    text: payload.text,
  };
  await addTodo(todo);

  outputValidation.parse(todo);

  res.json(todo);
};

export default handler;
