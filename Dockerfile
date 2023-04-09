FROM postgres
COPY ./docker-entrypoint-initdb.d /docker-entrypoint-initdb.d/

FROM node:16 as build-node

# install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- --default-toolchain stable -y

ENV PATH="/root/.cargo/bin:${PATH}"

RUN rustup update

RUN rustup component add rust-src

RUN cargo install --force --locked cargo-contract

RUN cargo install cargo-dylint dylint-link


# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# copying packages first helps take advantage of docker layers
COPY package*.json ./

# Update npm version
RUN npm install -g npm

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080

CMD [ "npm", "run", "start" ]
