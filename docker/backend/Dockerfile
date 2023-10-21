FROM node

RUN mkdir -p /app
WORKDIR /app

#COPY ./backend/package*.json .


COPY ./backend .
COPY ./common ../common



EXPOSE 3000
COPY	./backend/entrypoint.sh .
# COPY	./backend/.env .
RUN		chmod 777 entrypoint.sh
#CMD tail -f /dev/null
ENTRYPOINT ["sh",  "entrypoint.sh" ]
#CMD npm run start:dev
