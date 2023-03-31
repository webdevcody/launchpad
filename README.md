# Overview

This is a prototype of a file based routing REST framework that uses express.js under the hood. The goal of this framework is to provide a single CLI command to deploy the REST api to AWS serverless / api gateway. I want to provide built in mechanisms for dependecy injection and provide a standard structure one can follow to build a "production ready api". This includes

- node 18 compatible
- fully typesafe
- file based routing
- logger included
- baked in dependency injection solution
- a one command deployment into an AWS mono lambda
- ...more to come maybe

## Getting Started

Launchpad is a collection of libraries and tools to help you build and deploy a production ready api to AWS serverless. You can also run the server as a stand alone service inside a container or VM, but those are not our main goals.

The Launchpad package used for running this api is called [shuttle](./packages/shuttle/). You can build a simple API using shuttle by doing the following:

To setup a launchpad project, run the following in a blank directory:

`npm create @webdevcody/launchpad@latest`

And here is an example of setting up your shuttle server:

Running your server using a `npm run dev` should host your server on http://localhost:8080

## Entry Point

After setting up the project using the `npm create` script, the `src/index.ts` file will call the `shuttle` to setup the api server.

```ts
// src/index.ts
import shuttle, { InjectionKey } from "@webdevcody/shuttle";
const server = shuttle();
export type ShuttleHandler = typeof server["handler"];
```

Take note of the exported `ShuttleHandler` type, you'll want to use this when you define your handler functions if you want type safety.

## File Based Routing

Shuttle uses file based routing for defining api endpoints, and it'll search your project for a `src/routes` directory and dynamically register endpoints via files it finds. The supported file names are:

- get.ts
- post.ts
- patch.ts
- put.ts
- delete.ts
- head.ts
- options.ts

The location of the the endpoint file will determine the rest API endpont. For example, if you want an endpoint that accepts http GET requests at a path of /api/todos, you'd create a file called `src/routes/api/todos/get.ts`. This would make an endpoint accessible at `http://localhost:8080/api/todos`.

To start processing the request, your file must export a default handler which looks like this:

```ts
// src/routes/get.ts
import { ShuttleHandler } from "../";

export const handler: ShuttleHandler = async ({ logger }, req, res) => {
  logger.info("this is your todo endpoint");
  res.json([
    {
      task: "hello",
    },
  ]);
};

export default handler;
```

Like mentioned, the handler is a normal express handler with additional context parameters passed into the first parameter. The context parameter will contain various helper functions provided by the shuttle library.

## Logger

Shuttle uses winston for the logging. The logger is provided inside the context parameter which you can use to log errors, warnings, debug, or info logs. The following methods exist on the logger by default:

- error
- warn
- info
- http
- verbose
- debug
- silly

You can set the LOG_LEVEL in your .env file. Depending on the log level you set, you will filter out less important messages your api logs. For example, setting LOG_LEVEL="error" will only show logs created via a `logger.error` call. LOG_LEVEL="info" will print debug and all levels above it, including warn and error.

## Inject & Provide

When setting up shuttle, you can use the provide callback function for configuring any dependencies via a IoC container.

```ts
// src/index.ts
import shuttle, { InjectionKey } from "shuttle";

function myFunction() {
  return "hello";
}

export const YourKey = Symbol() as InjectionKey<typeof myFunction>;

shuttle({
  providers(provide) {
    provide(YourKey, myFunction);
  },
});
```

and you can easily retrieve your depenedencies inside your handlers like so:

```ts
// src/routes/todos/get.ts
import { type ShuttleHandler } from "shuttle";
import { YourKey } from "../..";

export const handler: ShuttleHandler = async ({ inject }, req, res) => {
  const myFunction = inject(YourKey);
  res.json({
    message: myFunction(), // "hello"
  });
};

export default handler;
```

By using your InjectionKey, the value returned will be typed correctly for you to use.

## Environment Variables

Shuttle uses `envalid` and `dotenv` to load in your `.env` and verify your environment variables are setup as needed. In order to achieve typesafe env variables, you'll need to add the following code to your main `src/index.ts` file and export the type so you can use it in your handlers.

```ts
// src/index.ts
import shuttle from "@webdevcody/shuttle";

const { env } = shuttle({
  env({ str }) {
    return {
      MY_ENV: str({
        choices: ["have", "fun"],
      }),
    };
  },
});

export type Env = typeof env;
```

and inside your handlers, you can make typesafe env objects like so:

```ts
// src/routes/todos/get.ts
import { type ShuttleHandler } from "../..";

export const handler: ShuttleHandler = async (
  { env },
  req,
  res
) => {
  res.json(env.MY_ENV),
};

export default handler;
```

### Final Considerations

This is a prototype and more of an experiment to practice my knowledge in building typesafe libraries. Do not use this in production. You're welcome to contribute if you find this project interesting.
