#!/bin/bash -e


SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

# Run TypeScript build
rm -rf dist
npx tsc --outDir dist

rm -rf tmp
mkdir -p tmp

cp -R dist/* tmp
cp package.json tmp
cp $SCRIPT_DIR/../index.js tmp
pushd tmp
npm i @vendia/serverless-express
npm i --production
popd

# Create the archive
rm -rf out
mkdir -p out
pushd tmp
zip -r "../out/payload.zip" .
popd

