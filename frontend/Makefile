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
	# Build the Docker image
	docker build -t idb-frontend .
	# Run container, mount project folder, and install dependencies inside container
	docker run -it -p 3000:3000 -v ${PWD}:/app -w /app --name idb-frontend idb-frontend sh -c "npm install && npm start"

# Run this for all future uses of the Docker
docker:
	# Start existing container and install any new dependencies
	docker start -ai idb-frontend || \
	docker run -it -p 3000:3000 -v ${PWD}:/app -w /app --name idb-frontend idb-frontend sh -c "npm install && npm start"
	