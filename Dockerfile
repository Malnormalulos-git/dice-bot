FROM node:20.11.1

ENV WORKDIR=/app
WORKDIR $WORKDIR

COPY ./dist .
COPY ./.env .

COPY package*.json .

RUN npm install

CMD ["node", "./src/index.js"]