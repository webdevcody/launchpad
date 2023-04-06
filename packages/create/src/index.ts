import shuttle from "@webdevcody/shuttle";
import { createTodo, getTodos } from "./persistence/todos";

export const { createHandler, app } = shuttle({
  providers: {
    createTodo,
    getTodos,
  },
  env({ str }) {
    return {
      MY_ENV: str({
        choices: ["have", "fun"],
      }),
    };
  },
});
