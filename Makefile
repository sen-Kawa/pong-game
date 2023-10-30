# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: fhenrich <fhenrich@student.42wolfsburg.de> +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/06/05 18:50:57 by hrings            #+#    #+#              #
#    Updated: 2023/10/30 09:18:59 by fhenrich         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

all: build up

build:
	@docker compose -f docker-compose.yml build
#--no-cache

up:
	@docker compose -f docker-compose.yml up -d

down:
	@docker compose -f docker-compose.yml down

production:
	@docker compose -f docker-compose-prod.yml build
	@docker compose -f docker-compose-prod.yml up -d

re-prod: clean production

clean:
	-docker stop $$(docker ps -qa)
	-docker rm $$(docker ps -qa)
	-docker rmi -f $$(docker images -qa)
	-docker volume rm $$(docker volume ls -q)
	-docker network rm $$(docker network ls -q) 2>/dev/null

fclean: clean
	@docker system prune -f

.PHONY: all re down clean fclean production re-prod
