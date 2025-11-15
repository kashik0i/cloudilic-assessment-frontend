FROM node:24

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install

# Bundle app source
COPY . .
RUN pnpm build

# Copy built assets into the shared volume path used by docker-compose
CMD ["sh", "-c", "mkdir -p ./prod && cp -a ./dist/. ./prod/"]
