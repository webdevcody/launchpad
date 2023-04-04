#!/bin/bash

npm init -f
echo "a"
npm i @webdevcody/create-launchpad
echo "b"
cp -R ./node_modules/@webdevcody/create-launchpad/* .
echo "c"
cp -R ./node_modules/@webdevcody/create-launchpad/. .
echo "d"
cp .env.sample .env
echo "e"
npm i --save @webdevcody/shuttle@latest
echo "f"
npm ci