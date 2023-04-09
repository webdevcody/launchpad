#!/bin/bash -e

# Define the name of the Lambda function
FUNCTION_NAME="$APP_PREFIX-lambda-function"

# Define the path to the .zip file containing the function code
ZIP_FILE_PATH="./out/payload.zip"

# Define the name of the IAM role that the function will use
IAM_ROLE_NAME="$APP_PREFIX-lambda-role"

if aws iam get-role --role-name "$IAM_ROLE_NAME" &> /dev/null; then
  echo "IAM role '$IAM_ROLE_NAME' already exists, skipping creation."
else
  # Create the IAM role for the Lambda function
  aws iam create-role \
    --role-name "$IAM_ROLE_NAME" \
    --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{"Effect": "Allow","Principal": {"Service": "lambda.amazonaws.com"},"Action": "sts:AssumeRole"}]}'
fi

# Attach the appropriate permissions to the IAM role
aws iam attach-role-policy \
  --role-name "$IAM_ROLE_NAME" \
  --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"

# Retrieve the AWS account ID for the currently authenticated user
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

if aws lambda get-function --function-name "$FUNCTION_NAME" &> /dev/null; then
  echo "Lambda function '$FUNCTION_NAME' already exists, updating with new zip file..."
  aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file "fileb://$ZIP_FILE_PATH" \
    --region "$REGION"

  # Publish a new version of the function
  while ! aws lambda publish-version --function-name "$FUNCTION_NAME" --region "$REGION" --output text --query 'Version'; do
    echo "Retrying publish-version command in 5 seconds..."
    sleep 5
  done
  echo "New version published successfully"
else
  # Create the Lambda function
  aws lambda create-function \
    --function-name "$FUNCTION_NAME" \
    --runtime "nodejs18.x" \
    --role "arn:aws:iam::$AWS_ACCOUNT_ID:role/$IAM_ROLE_NAME" \
    --handler "index.handler" \
    --zip-file "fileb://$ZIP_FILE_PATH" \
    --region "$REGION"
fi

# Load environment variables from .env.prod file
source .env.prod

# Verify that the function was created successfully
aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION"

aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --environment Variables="{`cat .env.prod | xargs | sed 's/ /,/g'`}"

