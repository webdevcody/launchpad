import { Todo } from "@prisma/client";
import fetch from "cross-fetch";

export function getTodos() {
  return fetch("http://localhost:8080/todos").then((response) =>
    response.json()
  ) as Promise<Todo[]>;
}
