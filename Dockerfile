# Docker Stage 1 - Build Stage
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Docker Stage 2 - Production Stage
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY ecosystem.config.js .

EXPOSE 6100

# Install PM2 globally
RUN npm install pm2 -g

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
