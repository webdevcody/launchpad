import { createHandler } from "../..";

export default createHandler({
  output(z) {
    return z.array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    );
  },
  async handler({ providers }) {
    const { getTodos } = providers;
    const todos = await getTodos();
    return todos;
  },
});
