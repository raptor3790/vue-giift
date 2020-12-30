FROM node:10.15.3-alpine

RUN apk upgrade --no-cache --update \
  && apk add inotify-tools \
  && apk add curl \
  && apk add nano \
  && rm -rf /var/cache/apk/*

RUN mkdir /giift
RUN chmod 777 /giift

# Install client dev deps since we'll be building the vue project
COPY ./ /giift/


WORKDIR /giift/api
# Don't keep .env from local env
RUN rm -f ./.env
RUN yarn install

EXPOSE 3000
ENTRYPOINT yarn run start
