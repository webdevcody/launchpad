import { createHandler, GetTodosKey } from "../..";

export default createHandler({
  output(z) {
    return z.array(
      z
        .object({
          id: z.string(),
          text: z.string(),
        })
        .strict()
    );
  },
  async handler({ inject, logger }) {
    logger.info("getting todos");
    const getTodos = inject(GetTodosKey);
    const todos = await getTodos();
    return todos;
  },
});
