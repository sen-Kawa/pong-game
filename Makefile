# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: hrings <hrings@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/06/05 18:50:57 by hrings            #+#    #+#              #
#    Updated: 2023/06/09 09:46:11 by hrings           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

all: install build up

install:
	npm install --prefix backend
	npm install --prefix frontend

build:
	@docker compose -f docker-compose.yml build
#--no-cache

up:
	@docker compose -f docker-compose.yml up -d

down:
	@docker compose -f docker-compose.yml down

clean:
	-docker stop $$(docker ps -qa)
	-docker rm $$(docker ps -qa)
	-docker rmi -f $$(docker images -qa)
	-docker volume rm $$(docker volume ls -q)
	-docker network rm $$(docker network ls -q) 2>/dev/null

fclean: clean
	@docker system prune -f

.PHONY: all re down clean fclean install
