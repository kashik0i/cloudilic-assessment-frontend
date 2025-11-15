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

CMD ["cp", "./dist", "/usr/src/app/prod", "-r"]