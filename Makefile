NAME=ft_transcendence

ENV_PATH=./srcs/.env

all: $(NAME)

re: fclean
	make all

$(NAME): setup
	docker-compose -f srcs/docker-compose.yml up --build

$(ENV_PATH):
	./srcs/generate-env.sh

mode_cmd:
	docker exec -it nodejs /bin/bash

setup: $(ENV_PATH)

clean:
	rm -rf $(ENV_PATH)

fclean: clean
	sudo rm -rf ~/data/mariadb
	sudo rm -rf ~/data/wordpress

clean_docker:
	docker rm -vf $(docker ps -aq)
	docker rmi -f $(docker images -aq)

.PHONY: all re $(NAME) setup clean fclean clean_docker
