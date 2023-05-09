# makefile

.PHONY: help

help:
	@echo "--- Options ---"


MYDIR = .


prisma:
	@echo "Generating prisma instance..."
	dotenv -e .env.local -- npx prisma generate

data:
	@echo "Generating data..."
	include .env.local
	export
	dotenv -e .env.local -- npx ts-node lib/scripts/seed-database.ts



local-migrations:
	@echo "Applying migrations locally ..."
	dotenv -e .env.local -- npx prisma migrate dev

prod-migrations:
	include .env.prod
	export
	@echo "Applying migrations to producting"
	dotenv -e .env.prod -- npx prisma migrate reset --force
	data




