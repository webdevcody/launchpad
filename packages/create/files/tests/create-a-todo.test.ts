import { createTodo } from "./api/create-todo";

describe("POST@/todos", () => {
  it("should verify the output only has an id and text", async () => {
    const createdTodo = await createTodo({ text: "hello world" });

    expect(createdTodo).toEqual({
      text: "hello world",
      id: expect.any(String),
    });
  });
});
