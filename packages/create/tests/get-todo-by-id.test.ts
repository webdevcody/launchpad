import { Todo } from "@prisma/client";
import { createTodo } from "./api/create-todo";
import { getTodo } from "./api/get-todo";

describe("GET@/todos/:id", () => {
  let existingTodo: Todo;

  beforeEach(async () => {
    existingTodo = await createTodo({
      text: "ligma",
    });
  });

  it("the existing todo should be send back when hitting the GET endpoint", async () => {
    const todo = await getTodo(existingTodo.id);
    expect(todo).toEqual(existingTodo);
  });
});
