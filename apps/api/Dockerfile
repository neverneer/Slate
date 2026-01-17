FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

RUN npm install

COPY . .

FROM base AS development
WORKDIR /app/apps/api
CMD ["npm", "run", "dev"]

FROM base AS builder
WORKDIR /app/apps/api
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder /app/apps/api/package*.json ./
RUN npm install --production

COPY --from=builder /app/apps/api/dist ./dist

EXPOSE 3000

CMD ["npm", "start"]
