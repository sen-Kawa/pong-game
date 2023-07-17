FROM node


RUN mkdir -p /app
WORKDIR /app

COPY ./backend/package*.json .

#RUN npm ci
RUN npm install

EXPOSE 3000

CMD npm run start:dev
