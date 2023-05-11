import prisma from '../prisma'
import * as dotenv from 'dotenv'
import { UserJSON } from '@clerk/nextjs/dist/api'
import csv from 'csvtojson'
import { User } from '@prisma/client'

dotenv.config()

const clr = '\x1b[36m%s\x1b[0m'

const BASE_URL = `https://api.clerk.dev/v1`
const CSV_DATA_PATH = 'test-data/'

async function getUsers(): Promise<UserJSON[]> {
  const response = await fetch(`${BASE_URL}/users?limit=100`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
    }
  })
  const users = (await response.json()) as UserJSON[]
  return users
}

async function getTestData() {
  const items = await csv().fromFile(`${CSV_DATA_PATH}/Items.csv`)
  const keywords = await csv().fromFile(`${CSV_DATA_PATH}/ItemKeyWords.csv`)
  return { items, keywords }
}

getUsers().then((users: UserJSON[]) => {
  console.info(clr, `Found ${users.length} Users`)
  users.forEach(async (user: UserJSON) => {
    const databaseUser: User = {
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email_addresses[0].email_address,
      lastLoggedIn: new Date(user.last_sign_in_at),
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at)
    }
    const dbuser = await prisma.user.create({ data: { ...databaseUser } })
    console.info(clr, 'Created User:')
    console.table(dbuser)
  })

  getTestData().then(({ items, keywords }) => {
    console.info(
      clr,
      `Found ${items.length} Items, and ${keywords.length} Keywords`
    )
  })
})
