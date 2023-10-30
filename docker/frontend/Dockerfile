FROM node:20

COPY ./frontend /app
COPY ./common /common
WORKDIR /app

#COPY ./frontend/package*.json .

#RUN npm install
# RUN npm run lint

EXPOSE 3030

CMD npm install && npm run dev
