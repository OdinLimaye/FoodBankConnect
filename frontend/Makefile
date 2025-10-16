# Makefile for /frontend 

# Default commit message
message ?= "Another commit"

push-main:
	git switch main
	git add .
	git commit -m "$(message)"
	git push origin main

push-phase2:
	git switch phase2
	git add .
	git commit -m "$(message)"
	git push origin phase2

log:
	git log > git-log.txt

status:
	git fetch
	git status

# Run this the very first time you use the Docker
docker-setup:
	docker run -it -p 3000:3000 -v ${PWD}:/app -w /app idb-frontend

# Run this for all future uses of the Docker
docker:
	docker start -ai 535e07ae1540
