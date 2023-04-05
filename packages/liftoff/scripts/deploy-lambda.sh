#!/bin/bash -e

if [[ -z "$APP_PREFIX" ]]; then
  echo "Error: APP_PREFIX environment variable is not defined"
  exit 1
fi


# Define the name of the Lambda function
FUNCTION_NAME="$APP_PREFIX-lambda-function"

# Define the path to the .zip file containing the function code
ZIP_FILE_PATH="./out/payload.zip"

# Define the AWS region where the function will be created
AWS_REGION="us-east-1"

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
    --region "$AWS_REGION"
  echo "Lambda function '$FUNCTION_NAME' updated successfully."
else
  # Create the Lambda function
  aws lambda create-function \
    --function-name "$FUNCTION_NAME" \
    --runtime "nodejs18.x" \
    --role "arn:aws:iam::$AWS_ACCOUNT_ID:role/$IAM_ROLE_NAME" \
    --handler "index.handler" \
    --zip-file "fileb://$ZIP_FILE_PATH" \
    --region "$AWS_REGION"
fi

# Verify that the function was created successfully
aws lambda get-function --function-name "$FUNCTION_NAME" --region "$AWS_REGION"
