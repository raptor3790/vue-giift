#!/bin/sh

cd ./client && yarn build
aws s3 rm s3://cdn.giift.app/client/latest --recursive --profile giift
aws s3 cp ./dist s3://cdn.giift.app/client/latest --recursive --profile giift --acl public-read
