import { v4 as uuid } from "uuid";

type Todo = {
  id: string;
  text: string;
};

const todos: Todo[] = [];

export async function createTodo(todo: Omit<Todo, "id">) {
  const newTodo: Todo = { id: uuid(), ...todo };
  todos.push(newTodo);
  return newTodo;
}

export async function getTodos() {
  return [...todos];
}
