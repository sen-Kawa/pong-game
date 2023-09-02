# ft_transcendence
## Installation instructions
### Install
```
git clone https://github.com/SuperDulli/ft_transcendence.git
```
### Build and Run
- Create/copy the .env files in project root, /frontend, /backend => ask us for details & look at the `env-sample` files.
- `make all` runs npm install in before building the container images (for now)
- Run `npx prisma migrate dev` in the backend container to create/update the database (switch the db-url from db to localhost first and after that to db back again)

### Use
```
localhost:8080/
```
