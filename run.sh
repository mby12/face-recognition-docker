#!/bin/bash
CL='\033[0m'
BLUE='\033[0;34m'
WHITE='\033[0;37m'
RED='\033[0;31m'
GREEN='\033[1;32m'

ENV_FILE=.env.local

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}[Error] ENV File NOT Exists.${CL}"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}[Error] Docker is not running.${CL}" >&2

    exit 1
fi

source $ENV_FILE

if [[ "" = $APP_PORT ]]; then
    echo -e "${RED}[Error] Empty APP_PORT Value in Env${CL}"
    exit 1
fi

echo -e "${GREEN}[Info] Production Environment Detected${CL}"
docker compose --env-file ./.env.local up --build -d
