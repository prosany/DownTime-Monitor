FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production

RUN npm install pm2 -g

EXPOSE 6100

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
