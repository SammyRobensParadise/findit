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
	bash/seed-database



local-migrations:
	@echo "Applying migrations locally ..."
	dotenv -e .env.local -- npx prisma migrate dev

prod-migrations:
	@echo "Applying migrations to production"
	dotenv -e .env.prod -- npx prisma migrate deploy



studio:
	dotenv -e .env.local -- npx prisma studio



