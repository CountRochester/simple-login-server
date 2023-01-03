FROM node:16.19.0-alpine3.17 as builder
WORKDIR /app
COPY . .
RUN npm i -g pnpm
RUN pnpm install --ignore-scripts
RUN pnpm generate
RUN pnpm build

FROM node:16.19.0-alpine3.17 as prebase
WORKDIR /app
COPY . .
RUN npm i -g pnpm
RUN pnpm install --ignore-scripts --omit=dev
RUN pnpm generate

FROM node:16.19.0-alpine3.17
ARG API_SERVER_PORT=5000

WORKDIR /app
COPY --from=builder /app/build ./
COPY --from=prebase /app/node_modules ./node_modules
COPY ./package.json .
COPY ./src/store/db/schema ./src/store/db/schema

EXPOSE $API_SERVER_PORT

CMD ["yarn", "start"]