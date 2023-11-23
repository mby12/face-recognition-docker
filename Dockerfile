# Build commands
# docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t thebigpotatoe/face-recognition-docker:latest .
# docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -f ./Dockerfiles/build-no-tfjs.dockerfile -t thebigpotatoe/face-recognition-docker:no-tfjs .

# Specify a build image
FROM node:16.20.2-slim

# Install build tools
RUN apt-get update -y && apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Change working directory
WORKDIR /usr/app

# Install NPM packages individually
RUN npm install express
RUN npm install multer
RUN npm install express-list-endpoints
RUN npm install --build-from-source canvas 
RUN npm install face-api.js@0.21.0
RUN npm install @tensorflow/tfjs-node@1.2.11
RUN npm install mongodb
RUN npm install cors

# Copy in application files and folders
# COPY ./app /usr/app
# COPY ./descriptor_creator/descriptors.json /usr/app/descriptors.json # Uncomment to back in descriptors

# Start app.js with node
CMD ["node", "app.js"]