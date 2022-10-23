NAME=ft_transcendence

ENV_PATH=./app/.env

all: $(NAME)

re: fclean
	make all

$(NAME): setup
	docker-compose -f app/docker-compose.yml up --build

$(ENV_PATH):
	./app/generate-env.sh

# dev only
run_front:
	cd app; ./front/node-entrypoint.sh "npm" "start"

# dev only
run_back:
	cd app; ./pong/node-entrypoint.sh "npm" "run" "start:dev"

mode_cmd:
	docker exec -it pong /bin/bash

setup: $(ENV_PATH)

clean:
	rm -rf $(ENV_PATH)

fclean: clean
	sudo rm -rf ~/app/data

clean_docker:
	docker rm -vf $(docker ps -aq)
	docker rmi -f $(docker images -aq)

.PHONY: all re $(NAME) setup clean fclean clean_docker
