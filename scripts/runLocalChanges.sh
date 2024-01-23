#!/bin/bash

yarn build

docker build --platform=linux/amd64 -t capacity-integration-service-test .
docker run --env-file ./test.env capacity-integration-service-test
