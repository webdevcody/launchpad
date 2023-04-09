import { Todo } from "@prisma/client";
import fetch from "cross-fetch";

export function getTodo(todoId: string) {
  return fetch(`http://localhost:8080/todos/${todoId}`).then((response) =>
    response.json()
  ) as Promise<Todo>;
}
