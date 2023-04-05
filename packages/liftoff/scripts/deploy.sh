#!/bin/bash -e

if [[ -z "$APP_PREFIX" ]]; then
  echo "Error: APP_PREFIX environment variable is not defined"
  exit 1
fi

if [[ -z "$REGION" ]]; then
  echo "Error: REGION environment variable is not defined"
  exit 1
fi

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

$SCRIPT_DIR/compile-project.sh
$SCRIPT_DIR/setup-s3.sh
$SCRIPT_DIR/deploy-lambda.sh