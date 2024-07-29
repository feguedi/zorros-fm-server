FROM node:20-alpine

ARG NODE_ENV="production"
ENV NODE_ENV="production"

WORKDIR /app
COPY .env ./
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install

COPY . .

EXPOSE 8081

CMD [ "pnpm", "start" ]
