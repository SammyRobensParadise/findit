# Findit!

Findit is a simple application that allows you to note where items may when you forget later!

## Live URL: [findit.vercel.appp](https://findit.vercel.app)

## Local Development

1. Clone Repository: `https://github.com/SammyRobensParadise/findit.git`
2. Install Dependencies using `npm` or yarn `npm install` or `yarn`
3. Create a local `postgres` database. Follow [this guide](https://www.prisma.io/dataguide/postgresql/setting-up-a-local-postgresql-database).
4. create a local `.env.local` env file that looks like the following:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="<KEY>"
CLERK_SECRET_KEY="<SECRET_KEY>"
DATABASE_URL="postgres://<USER>:<PASSWORD>@localhost:5432/findit"
```

5. Generate prisma instance `make prisma`
6. Run Local Migrations by running `make local-migrations`
7. Seed the database by running `make data`. Note that you will need to supply your own CSV data files with which to seed the database. refer to `lib/scripts/seed-database.ts`
8. Start the application by running `npm run dev` or using the debug tooling in vs code.
