#!/bin/bash -e

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")


rm -rf dist
mkdir -p dist

# Run TypeScript build
rm -rf tmp
mkdir -p tmp
mkdir -p tmp/prisma

cp -R src tmp/src
cp prisma/schema.prisma tmp/prisma
cp package.json tmp
cp $SCRIPT_DIR/../index.ts tmp

pushd tmp
npm i @vendia/serverless-express
npm i --production
npx prisma generate

mkdir -p out/src/routes
npx esbuild index.ts --bundle --outdir=out --platform=node

mkdir -p out/.prisma/client
cp -R ./node_modules/.prisma/client/libquery_engine-rhel-* out
cp -R ./node_modules/.prisma/client/libquery_engine-rhel-* out/.prisma/client

find src/routes -name '*.ts' | while read filepath; do
  outdir="out/$(dirname "$filepath")";
  mkdir -p $outdir;
  echo "outdir $outdir"
  cp ../prisma/schema.prisma $outdir
  npx esbuild "$filepath" --bundle --outdir="$outdir" --platform=node;
done

# find out/src/routes -name '*.js' -exec sh -c 'mv "$0" "${0%.js}.mjs"' {} \;
# find out -name '*.js' -exec sh -c 'mv "$0" "${0%.js}.mjs"' {} \;

popd



# Create the archive
rm -rf out
mkdir -p out
cp prisma/schema.prisma tmp/out

pushd tmp/out
zip -r "../../out/payload.zip" .
popd

