FROM node:20

RUN mkdir -p /app
WORKDIR /app

COPY ./frontend/package*.json .

RUN npm install
# RUN npm run lint

EXPOSE 3030

CMD npm run dev
