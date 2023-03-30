type Todo = {
  id: string;
  text: string;
};

const todos: Todo[] = [
  {
    id: "testing",
    text: "hello world",
  },
];

export async function getTodos() {
  return [...todos];
}

export async function addTodo(todo: Todo) {
  todos.push(todo);
}
export async function getTodo(todoId: string) {
  return todos.find((todo) => todo.id === todoId);
}
