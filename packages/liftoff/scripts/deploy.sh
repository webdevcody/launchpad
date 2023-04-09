#!/bin/bash -e

# Define required environment variables
REQUIRED_VARS=("APP_PREFIX" "REGION")

# Loop through the required variables and check if they are defined
for VAR in "${REQUIRED_VARS[@]}"
do
    if [[ -z "${!VAR}" ]]; then
        echo "Error: ${VAR} environment variable is not defined"
        MISSING_VARS=true
    fi
done

# Exit with an error if any required variables are missing
if [ "${MISSING_VARS}" = true ]; then
    exit 1
fi

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

$SCRIPT_DIR/compile-project.sh
$SCRIPT_DIR/deploy-lambda.sh
$SCRIPT_DIR/setup-api-gateway.sh
$SCRIPT_DIR/clean-up.sh
