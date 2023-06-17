FROM node:20

RUN mkdir -p /app
WORKDIR /app

COPY ./backend/package*.json .

RUN npm ci

EXPOSE 3000

CMD npm run start:dev
