import { db } from "./db";

export type Todo = {
  id: string;
  text: string;
};

export async function createTodo(todo: Omit<Todo, "id">) {
  const newTodo = await db.todo.create({
    data: todo,
  });
  return newTodo;
}

export async function getTodos() {
  return await db.todo.findMany();
}

export async function getTodo(id: string) {
  return await db.todo.findUnique({
    where: {
      id,
    },
  });
}
