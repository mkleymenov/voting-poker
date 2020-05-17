#!/usr/bin/env bash

STAGE="prod"
STACK_BASE_NAME="voting-poker"

check_prerequisites() {
  if [ ! -x "$(command -v aws)" ]; then
    echo "AWS CLI is not installed. Please visit https://aws.amazon.com/cli/ for installation instructions."
    exit 1
  fi

  if [ ! -x "$(command -v sam)" ]; then
    echo "AWS SAM CLI is not installed. Please visit https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html for installation instructions."
    exit 1
  fi

  if [ ! -x "$(command -v node)" ]; then
    echo "Node.js is not installed. Please visit https://nodejs.org/en/download/ for download instructions."
    exit 1
  fi
}

package_app() {
  npm install &&
    npm test &&
    npm run clean &&
    npm run build &&
    npm run stage
}

deploy_rest_api() {
  local STACK_NAME="$STACK_BASE_NAME-rest-api-$STAGE"

  aws s3 ls "s3://$STACK_NAME/" >/dev/null 2>&1 ||
    aws s3 mb "s3://$STACK_NAME"

  sam package \
    --template-file infra/rest-api.yaml \
    --s3-bucket "$STACK_NAME" \
    --output-template-file build/rest-api-packaged.yaml

  sam deploy \
    --template-file build/rest-api-packaged.yaml \
    --stack-name "$STACK_NAME" \
    --capabilities CAPABILITY_IAM \
    --no-fail-on-empty-changeset
}

deploy_websocket_api() {
  local STACK_NAME="$STACK_BASE_NAME-websocket-api-$STAGE"

  aws s3 ls "s3://$STACK_NAME/" >/dev/null 2>&1 ||
    aws s3 mb "s3://$STACK_NAME"

  sam package \
    --template-file infra/websocket-api.yaml \
    --s3-bucket "$STACK_NAME" \
    --output-template-file build/websocket-api-packaged.yaml

  sam deploy \
    --template-file build/websocket-api-packaged.yaml \
    --stack-name "$STACK_NAME" \
    --capabilities CAPABILITY_IAM \
    --no-fail-on-empty-changeset
}

deploy_storage() {
  local STACK_NAME="$STACK_BASE_NAME-storage-$STAGE"

  aws cloudformation deploy \
    --template-file infra/storage.yaml \
    --stack-name "$STACK_NAME" \
    --no-fail-on-empty-changeset
}

case "$1" in
rest-api)
  check_prerequisites &&
    package_app &&
    deploy_storage &&
    deploy_rest_api
  ;;

websocket-api)
  check_prerequisites &&
    package_app &&
    deploy_storage &&
    deploy_websocket_api
  ;;

storage)
  check_prerequisites &&
    deploy_storage
  ;;

all)
  check_prerequisites &&
    package_app &&
    deploy_storage &&
    deploy_rest_api &&
    deploy_websocket_api
  ;;

*)
  echo "Usage: ./deploy.sh (rest-api | websocket-api | storage | all)"
  ;;
esac
