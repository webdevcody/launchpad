#!/bin/bash -e

BUCKET_NAME="$APP_PREFIX-lambda-zip-bucket"

# Check if the bucket exists
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
  echo "Bucket already exists: $BUCKET_NAME"
else
  # Create the bucket
  aws s3api create-bucket --bucket "$BUCKET_NAME" --region $REGION
  echo "Bucket created: $BUCKET_NAME"
fi
