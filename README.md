# Overview

This is a prototype of a file based routing REST framework that uses express.js under the hood. The goal of this framework is to provide a single CLI command to deploy the REST api to AWS serverless / api gateway. I want to provide built in mechanisms for dependecy injection and provide a standard structure one can follow to build a "production ready api". This includes

- fully typesafe
- logger included
- baked in dependency injection solution
- a one command deployment into AWS serverless.
- ...more to come maybe

# Setup

1. `npm i --save launchpad/shuttle`
2. `copy ./node_modules/launchpad/simple/* .`
3. `npm run -w example dev`

This will setup a simple an example API using the launchpad library.

## Todo

- do stuff
