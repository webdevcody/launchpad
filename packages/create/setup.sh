#!/bin/bash

npm init -f
npm i @webdevcody/create-launchpad
cp -R ./node_modules/@webdevcody/create-launchpad/files/* .
cp -R ./node_modules/@webdevcody/create-launchpad/files/. .
cp .env.sample .env
npm ci