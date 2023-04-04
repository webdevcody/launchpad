#!/bin/bash

npm init -f
npm i @webdevcody/create-launchpad
cp -R ./node_modules/@webdevcody/create-launchpad/* .
cp -R ./node_modules/@webdevcody/create-launchpad/. .
cp .env.sample .env
npm i --save @webdevcody/shuttle@latest
npm ci