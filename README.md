# ft_transcendence
SPA for playing online multiplayer pong

# How to get the project running

- create/copy the .env files in project root, /frontend, /backend => ask us for details & look at the `env-sample` files
- `make all` runs npm install in before building the container images (for now)
- run `npx prisma migrate dev` in the backend container to create/update the database (switch the db-url from db to localhost first and after that to db back again)
- open http://localhost:8080

... hopefully I did not forget something
