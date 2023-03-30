type Todo = {
  id: string;
  text: string;
};

const todos: Todo[] = [];

export async function getTodos() {
  return [...todos];
}

export async function addTodo(todo: Todo) {
  todos.push(todo);
}
