FROM node


RUN mkdir -p /app
WORKDIR /app

#COPY ./backend/package*.json .
COPY	./backend/prisma .
COPY	./backend/entrypoint.sh .
RUN		chmod 777 entrypoint.sh

#RUN npm ci
#RUN npm install
EXPOSE 3000

ENTRYPOINT ["sh", "entrypoint.sh"]
