#!/bin/sh

docker rmi -f $(docker images | grep "giift-api" | awk '/ / { print $3 }')
aws ecr get-login-password --profile=giift --region us-east-1 | docker login --username AWS --password-stdin 571491574076.dkr.ecr.us-east-1.amazonaws.com/giift-api
docker build -t giift-api -f ./api.dockerfile .
docker tag giift-api:latest 571491574076.dkr.ecr.us-east-1.amazonaws.com/giift-api:latest
docker push 571491574076.dkr.ecr.us-east-1.amazonaws.com/giift-api:latest