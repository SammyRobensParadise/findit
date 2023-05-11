import prisma from '../prisma'
import * as dotenv from 'dotenv'
import { UserJSON } from '@clerk/nextjs/dist/api'
import csv from 'csvtojson'
import { User, Keyword as PrismaKeyword } from '@prisma/client'

dotenv.config()

const clr = '\x1b[36m%s\x1b[0m'

const BASE_URL = `https://api.clerk.dev/v1`
const CSV_DATA_PATH = 'test-data/'

type CSVItem = {
  id: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
}

type Item = {
  id: number
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
  userId: string
}

type CSVKeyword = { name: string; itemId: string }

type Keyword = { name: string; itemId: number }

type CSVRefTable = { xrefCounter: string; itemId: string; keywordId: string }

type RefTable = { xrefCounter: number; itemId: number; keywordId: number }

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

async function getTestData(userId: string) {
  const items: CSVItem[] = await csv().fromFile(`${CSV_DATA_PATH}/Items.csv`)
  const keywords: CSVKeyword[] = await csv().fromFile(
    `${CSV_DATA_PATH}/ItemKeyWords.csv`
  )
  const refTable: CSVRefTable[] = await csv().fromFile(
    `${CSV_DATA_PATH}/XrefTable.csv`
  )

  const typedRefTable: RefTable[] = refTable.map((ref) => {
    let newRef = ref as unknown as RefTable
    newRef.itemId = parseInt(ref.itemId)
    newRef.keywordId = parseInt(ref.keywordId)
    newRef.xrefCounter = parseInt(ref.xrefCounter)
    return newRef
  })

  const typedItems = items.map((item): Item => {
    let newItem: Item = item as unknown as Item
    newItem.id = parseInt(item.id)
    newItem.createdAt = new Date(item.createdAt)
    newItem.updatedAt = new Date(item.updatedAt)
    newItem.userId = userId
    return newItem
  })

  const typedKeywords = keywords.map((keyword): Keyword => {
    let newKeyword: Keyword = keyword as unknown as Keyword
    newKeyword.itemId = parseInt(keyword.itemId)
    return newKeyword
  })

  return { items: typedItems, keywords: typedKeywords, refTable: typedRefTable }
}

async function createCollections({
  items,
  keywords,
  refTable,
  userId
}: {
  items: Item[]
  keywords: Keyword[]
  refTable: RefTable[]
  userId: string
}) {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId
      }
    })

    const collection = await prisma.collection.create({
      data: {
        name: 'My Collection',
        description: 'My first collection',
        user: {
          connect: {
            id: user.id
          }
        },
        items: {
          createMany: {
            data: [...items]
          }
        }
      }
    })
    const mappedKeywords = keywords.map((keyword) => {
      let newKeyword = keyword as PrismaKeyword
      newKeyword.collectionId = collection.id

      newKeyword.id = keyword.itemId
      newKeyword.itemId = null
      return newKeyword
    })

    await prisma.keyword.createMany({
      data: [...mappedKeywords]
    })

    Promise.all(
      mappedKeywords.map(async (keyword) => {
        const ref = refTable.find((ref) => ref.keywordId === keyword.id)
        await prisma.keyword.update({
          where: { id: keyword.id },
          data: {
            itemId: ref?.itemId
          }
        })
      })
    )

    return collection
  } catch (error) {
    console.error(error)
  }
}

let defaultUserId: string

getUsers()
  .then((users: UserJSON[]) => {
    console.info(clr, `Found ${users.length} Users`)
    Promise.all(
      users.map(async (user: UserJSON, idx) => {
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
        if (idx === 0) {
          defaultUserId = user.id
        }
      })
    )
      .then(() => {
        getTestData(defaultUserId)
          .then(({ items, keywords, refTable }) => {
            console.info(
              clr,
              `Found ${items.length} Items, and ${keywords.length} Keywords`
            )
            createCollections({
              items,
              keywords,
              refTable,
              userId: defaultUserId
            })
              .then((collection) => {
                console.info(clr, 'Generated Collection:')
                console.table(collection)
                console.info(clr, 'DONE!')
              })
              .catch((error) => console.error(error))
          })
          .catch((error) => console.error(error))
      })
      .catch((error) => console.error(error))
  })
  .catch((error) => console.error(error))
