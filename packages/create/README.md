# Overview

This is a project setup using launchpad. The default setup requires a postgres database which we've provided a docker-compose file which will host one for you.

## Running the Database

Assuming you have [docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/) setup, you can easily start your postgres database with the following command from the root directory of this repo. You can host your own postgres database without needing docker if you want, but docker will make your life much easier.

`docker-compose up`

## Running Locally

1. `npm i`
2. `npx prisma db push`
3. `npm run dev`

## Running Tests

1. `npm run dev`
2. `npm test`
