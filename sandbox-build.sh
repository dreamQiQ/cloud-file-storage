#!/bin/bash

# echo "external schema: "$1
# echo "external domain: "$2
# echo "external port: "$3
# echo "external commit_hash: "$4
# echo "external build_number: "$5
# echo "external docker_name: "$6

# BASIC_SCHEMA=$1
# if [ ! -n "$BASIC_SCHEMA" ]; then
# 	BASIC_SCHEMA=http
# fi

# BASIC_DOMAIN=$2
# if [ ! -n "$BASIC_DOMAIN" ]; then
# 	BASIC_DOMAIN=dcs.mayday5.me
# fi

# BASIC_PORT=$3
# if [ ! -n "$BASIC_PORT" ]; then
# 	BASIC_PORT=80
# fi

DOCKER_NAME=$6
if [ ! -n "$DOCKER_NAME" ]; then
	DOCKER_NAME=gomk
fi

# echo "real domain: "$BASIC_SCHEMA"://"$BASIC_DOMAIN":"$BASIC_PORT

rm -rf ./dist
mkdir -p dist

# echo "########## npm install cnpm #########"
#sudo npm i -g pnpm

# export NODE_ENV=" "
echo "########## npm install dedenpencies #########"
npm install

# echo "########## npm build dists #########"
# if [ $BASIC_PORT == '4009' ]; then
# 	export VUE_APP_V4_BASE_URL=$BASIC_SCHEMA://$BASIC_DOMAIN
# else
# 	export VUE_APP_V4_BASE_URL=$BASIC_SCHEMA://$BASIC_DOMAIN:$BASIC_PORT
# fi
# export VUE_APP_V4_BASE_URL=''
export NODE_ENV=production
# export VUE_APP_BUILD_TIME=$(($(date +%s) * 1000))
# export VUE_APP_BUILD_HASH=$4
# export VUE_APP_BUILD_NUMBER=$5
# echo "VUE_APP_V4_BASE_URL="$VUE_APP_V4_BASE_URL
# echo "VUE_APP_BUILD_TIME="$VUE_APP_BUILD_TIME
# echo "VUE_APP_BUILD_HASH="$VUE_APP_BUILD_HASH
# echo "VUE_APP_BUILD_NUMBER="$VUE_APP_BUILD_NUMBER
npm run build

echo "########## tar dists #########"
cd ./dist
# ./favicon.ico
tar -czf dist.tar.gz ./index.html ./assets ./media ./splash-screen.css ./favicon.ico

echo "########## docker build #########"
cd ../
docker build -t $DOCKER_NAME-f-files:latest -f ./sandboxdeploy/gomk-f-files-dockerfile ./dist
echo "########## docker build image end #########"
