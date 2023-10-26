FROM node

RUN mkdir -p /app
WORKDIR /app

COPY ./backend .
COPY ./common ../common
EXPOSE 3000
COPY	./backend/entrypoint_prod.sh .
RUN		chmod +x entrypoint_prod.sh
ENTRYPOINT ["sh",  "entrypoint_prod.sh" ]
