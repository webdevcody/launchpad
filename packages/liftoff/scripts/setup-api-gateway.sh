#!/bin/bash -e

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
FUNCTION_NAME="$APP_PREFIX-lambda-function"
API_NAME="$APP_PREFIX-api-gateway"

FUNCTION_ARN="arn:aws:lambda:$REGION:$AWS_ACCOUNT_ID:function:$APP_PREFIX-lambda-function"


# Check if API Gateway already exists
EXISTING_API=$(aws apigatewayv2 get-apis --query "Items[?Name=='$API_NAME']")
echo "EXISTING_API $EXISTING_API"

if [ "$EXISTING_API" == "[]" ]; then
  # Create an API Gateway REST API
  API_ID=$(aws apigatewayv2 create-api --name $API_NAME --protocol-type HTTP --target $FUNCTION_ARN | jq -r '.ApiId')

  # Create an API Gateway Integration
  INTEGRATION_ID=$(aws apigatewayv2 create-integration --api-id $API_ID --integration-type AWS_PROXY --integration-uri $FUNCTION_ARN --integration-method ANY --payload-format-version 2.0 | jq -r '.IntegrationId')

  # Create an API Gateway Route
  ROUTE_ID=$(aws apigatewayv2 create-route --api-id $API_ID --route-key "ANY /{proxy+}" --target "integrations/$INTEGRATION_ID" | jq -r '.RouteId')

  # Deploy the API Gateway
  DEPLOYMENT_ID=$(aws apigatewayv2 create-deployment --api-id $API_ID --description "Initial deployment" | jq -r '.DeploymentId')

  # Add permissions to Lambda function to allow API Gateway to invoke it
  aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id "apigateway-test-1" \
    --action "lambda:InvokeFunction" \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:$AWS_ACCOUNT_ID:$API_ID/*/*/*"


  # Print out the API Gateway URL
  URL="https://$API_ID.execute-api.$REGION.amazonaws.com/$DEPLOYMENT_ID"
  echo "API Gateway URL: $URL"
else
  echo "Api already exists, skipping"
fi