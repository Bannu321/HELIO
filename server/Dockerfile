FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

COPY server/package.json server/pnpm-lock.yaml ./server/
RUN cd server && pnpm install --frozen-lockfile --prod

COPY server ./server

WORKDIR /app/server
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
