import shuttle, { InjectionKey } from "shuttle";

import { addTodo, getTodos } from "./persistence/todos";

export const GetTodosKey = Symbol() as InjectionKey<typeof getTodos>;
export const AddTodosKey = Symbol() as InjectionKey<typeof addTodo>;

shuttle({
  port: 8080,
  providers(provide) {
    provide(GetTodosKey, getTodos);
    provide(AddTodosKey, addTodo);
  },
});
