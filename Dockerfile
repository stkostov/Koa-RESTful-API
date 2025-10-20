ARG BASE=cgr.dev/chainguard/node:latest
FROM ${BASE} AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY . .

RUN npm run build

FROM ${BASE} AS runner
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY --from=builder /app/dist ./dist

EXPOSE 4000

ENV PORT=4000
ENV SECRET=super-secret

CMD ["dist/server.js"]
