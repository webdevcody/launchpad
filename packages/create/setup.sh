#!/bin/bash

npm init -f
npm i @webdevcody/create-launchpad
cp -R ./node_modules/@webdevcody/create-launchpad/* .
cp ./node_modules/@webdevcody/create-launchpad/.env.sample .
cp ./node_modules/@webdevcody/create-launchpad/gitignore .gitignore
cp .env.sample .env
npm i --save @webdevcody/shuttle
npm ci
npx prisma db push
rm setup.sh