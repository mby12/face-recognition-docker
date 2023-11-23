# Specify a base image
FROM node:16.20.2 AS build 

# Install build tools
RUN apt-get update -y && apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Change working directory
WORKDIR /usr/app

# Install NPM packages individually
RUN npm install --build-from-source canvas
RUN npm install face-api.js@0.21.0
RUN npm install @tensorflow/tfjs-node@1.2.11

# Copy in the app and weights
COPY ./descriptor_creator /usr/app
# /usr/app/descriptor_creator/faces
COPY ./app/weights /app/weights

# Run the descriptor creator
# RUN node descriptor-creator.js

ENTRYPOINT [ "node", "descriptor-creator.js" ]

# Export the descriptors
# FROM scratch AS export
# COPY --from=build /usr/app/descriptors.json /descriptors.json
# COPY --from=build /usr/app/detections /detections

# From root of this repo:
# docker buildx build -f build-descriptors.dockerfile -o descriptor_creator .