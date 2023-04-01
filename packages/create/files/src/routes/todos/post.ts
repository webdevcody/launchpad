import { createHandler, CreateTodoKey } from "../..";

export default createHandler({
  input(z) {
    return z.object({
      text: z.string(),
    });
  },
  output(z) {
    return z.object({
      id: z.string(),
      text: z.string(),
    });
  },
  async handler({ input, inject, logger, env }) {
    logger.info("getting todos");
    const createTodo = inject(CreateTodoKey);
    const todo = await createTodo({
      text: input.text,
    });
    return todo;
  },
});
