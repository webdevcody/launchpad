import shuttle, { createInjectionKey } from "@webdevcody/shuttle";
import { createTodo, getTodos } from "./persistence/todos";

export const CreateTodoKey = createInjectionKey(createTodo);
export const GetTodosKey = createInjectionKey(getTodos);

export const { createHandler, app } = shuttle({
  providers(provide) {
    provide(CreateTodoKey, createTodo);
    provide(GetTodosKey, getTodos);
  },
  env({ str }) {
    return {
      MY_ENV: str({
        choices: ["have", "fun"],
      }),
    };
  },
});
