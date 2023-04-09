import { Todo } from "@prisma/client";
import fetch from "cross-fetch";

export function createTodo({ text }: { text: string }) {
  return fetch("http://localhost:8080/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
    }),
  }).then((response) => response.json()) as Promise<Todo>;
}
