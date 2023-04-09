import { createHandler } from "../../..";

export default createHandler({
  input(z) {
    return z.object({
      id: z.string(),
    });
  },
  async handler({ input, providers }) {
    console.log("INPUT", input);
    const { getTodo } = providers;
    const todos = await getTodo(input.id);
    return todos;
  },
});
