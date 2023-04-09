import shuttle from "@webdevcody/shuttle";
import { createTodo, getTodos, getTodo } from "./persistence/todos";

export const { createHandler, app } = shuttle({
  providers: {
    createTodo,
    getTodos,
    getTodo,
  },
  env({ str }) {
    return {
      MY_ENV: str({
        choices: ["have", "fun"],
      }),
    };
  },
});
