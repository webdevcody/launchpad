import { createTodo } from "./api/create-todo";
import { getTodos } from "./api/get-todos";

describe("GET@/todos", () => {
  beforeEach(async () => {
    await createTodo({
      text: "ligma",
    });
  });

  it("should verify the output only has an id and text", async () => {
    const todos = await getTodos();
    expect(todos).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          text: "ligma",
        },
      ])
    );
  });
});
