FROM node

RUN mkdir -p /app
WORKDIR /app

COPY ./backend/package*.json .
#RUN npm ci
RUN npm install

COPY ./backend/docker-entrypoint.sh /bin/
RUN chmod +x /bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT [ "/bin/docker-entrypoint.sh" ]
# CMD npm run start:dev
# CMD sleep infinity # for getting rid of the nests "watch for file changes" that mess up the container logs
