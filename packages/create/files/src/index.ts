import shuttle, { InjectionKey } from "@webdevcody/shuttle";

export const ExampleKey = Symbol() as InjectionKey<string>;

const server = shuttle({
  providers(provide) {
    provide(ExampleKey, "welcome");
  },
  env({ str }) {
    return {
      MY_ENV: str({
        choices: ["have", "fun"],
      }),
    };
  },
});

export type ShuttleHandler = typeof server["handler"];
