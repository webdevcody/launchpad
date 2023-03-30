import shuttle, { InjectionKey } from "shuttle";

import { addTodo, getTodo, getTodos } from "./persistence/todos";

export const GetTodosKey = Symbol() as InjectionKey<typeof getTodos>;
export const GetTodoKey = Symbol() as InjectionKey<typeof getTodo>;
export const AddTodosKey = Symbol() as InjectionKey<typeof addTodo>;

const { env } = shuttle({
  port: 8080,
  providers(provide) {
    provide(GetTodosKey, getTodos);
    provide(AddTodosKey, addTodo);
    provide(GetTodoKey, getTodo);
  },
  env({ str }) {
    return {
      NODE_ENV: str({
        choices: ["development", "test", "production", "staging"],
      }),
    };
  },
});

export type Env = typeof env;
