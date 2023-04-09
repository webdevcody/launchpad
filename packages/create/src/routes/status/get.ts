import { createHandler } from "../..";

export default createHandler({
  output(z) {
    return z.object({
      status: z.string(),
    });
  },
  async handler() {
    return { status: "ok" };
  },
});
