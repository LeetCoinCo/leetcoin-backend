FROM --platform=linux/amd64 node:16-bullseye-slim as base

RUN apt-get update && \
    apt-get install --no-install-recommends -y \
        build-essential \
        python3 && \
    rm -fr /var/lib/apt/lists/* && \
    rm -rf /etc/apt/sources.list.d/*

RUN npm install --global --quiet npm truffle ganache

FROM base as truffle

WORKDIR /usr/src/app

CMD ["truffle", "version"]

#FROM base as ganache
#
#WORKDIR /usr/src/app
#
#CMD ["ganache", "--host", "0.0.0.0"]

FROM base as app

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# copying packages first helps take advantage of docker layers
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080

CMD [ "npm", "run", "start" ]
