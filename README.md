**This is a prototype, please don't use this in production.**

# Todo

- route params inside the file based routing approach
- fix the janky prisma schema duplication I had to do to get this working on aws
- fix the duplicate prisma binary I had to do to get this working on aws
- maybe consider authentication / authorization
- consider exposing middlewares so people can use existing express middlewares
- host the lambda behind api gateway
- ability to destroy all created resources
- ability to easily scope resource by environment (dev, stg, prod)
- remove color logs when deployed to production

## Overview

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

## Deployment to AWS

This project is setup to be easily deployed to an AWS Lambda and hosted behind api gateway. After setting up your launchpad project, you can deploy it to aws like so:

1. you should update prisma/schema.prisma to use something other than sqlite - sqlite will not work on serverless
2. `npx @webdevcody/liftoff`
3. login to aws and update your lambda's environment variables

## Tetsing

The create package comes with a couple of api tests written using jest. You can run this using:

1. `npm test`

## Entry Point

After setting up the project using the `npm create` script, the `src/index.ts` file will call the `shuttle` to setup the api server.

```ts
// src/index.ts
import shuttle from "@webdevcody/shuttle";

export const { createHandler, app } = shuttle({
  providers: {
    // any providers you want to inject into your handlers go here
  },
  env({ str }) {
    return {
      // any custom env variables would go here
      MY_ENV: str({
        choices: ["have", "fun"],
      }),
    };
  },
});
```

**you must export app for this to work in a deploy aws environment.**

You will use the `createHandler` function inside your api endpoints.

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
import { createHandler } from "../..";

export default createHandler({
  // return a zod object to define input validation
  input(z) {
    return z.object({
      text: z.string(),
    });
  },
  // return a zod object to define output validation, any undefined properties will be stripped from the response
  output(z) {
    return z.object({
      id: z.string(),
      text: z.string(),
    });
  },
  async handler({ input, providers, logger, env }) {
    // input: to get the combined incoming req.query, req.params, req.body
    // logger: used for logging with different levels
    // env: use to access the environment variables
    // providers: an object containing all your providers you defined in your src/index.ts

    const { createTodo } = providers;
    const todo = await createTodo({
      text: input.text,
    });
    return todo;
  },
});
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

## Providers

The purpose of the providers is to help you build a more maintainble code base by using dependency injection. Instead of your handlers directly importing lower level implementations such as prisma, mongoose, aws sdk calls such as s3.putObject, the idea is your handler should put one layer of abstraction between your business logic and the lower level details. We suggest you have clearly defined interfaces on your providers object. This also helps with unit testing your handlers by simply injecting mocks as function arguments.

## Environment Variables

Shuttle uses `envalid` and `dotenv` to load in your `.env` and verify your environment variables are setup as needed. In order to achieve typesafe env variables, you'll need to add the following code to your main `src/index.ts` file and export the type so you can use it in your handlers.

```ts
// src/index.ts
import shuttle from "@webdevcody/shuttle";

const { createHandler } = shuttle({
  env({ str }) {
    return {
      MY_ENV: str({
        choices: ["have", "fun"],
      }),
    };
  },
});
```

### Final Considerations

This is a prototype and more of an experiment to practice my knowledge in building typesafe libraries. Do not use this in production. You're welcome to contribute if you find this project interesting.
