import { createHandler } from "../..";

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
  async handler({ input, providers }) {
    const { createTodo } = providers;
    const todo = await createTodo({
      text: input.text,
    });
    return todo;
  },
});
