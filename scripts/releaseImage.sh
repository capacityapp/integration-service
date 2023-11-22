#!/bin/bash

yarn build

repo="public.ecr.aws/b3l4d2w0/capacity-integration-service"

aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin "$repo"

docker pull "$repo":latest || true
docker build --platform=linx/amd64 --cache-from "$repo":latest -t capacity-integration-service .
docker tag capacity-integration-service:latest "$repo":latest
docker push "$repo":latest
