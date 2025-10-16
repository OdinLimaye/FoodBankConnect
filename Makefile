# Makefile for root

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
