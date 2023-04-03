import { createHandler, GetTodosKey } from "../..";

export default createHandler({
  output(z) {
    return z.array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    );
  },
  async handler({ inject }) {
    const getTodos = inject(GetTodosKey);
    const todos = await getTodos();
    return todos;
  },
});
