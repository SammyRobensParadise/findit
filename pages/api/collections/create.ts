import prisma from '@/lib/prisma'
import { User } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

interface CreateRequest extends NextApiRequest {
  body: string
}

type NewCollection = {
  name: string
  description?: string
  userId: string
  userEmails: string[]
}

export default async function handler(
  req: CreateRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ messag: 'Method Not Allowed', keywords: null })
  }
  try {
    const body = JSON.parse(req.body)
    const data = body.data as NewCollection

    // get users
    let users: User[] = []
    const requestingUser = await prisma.user.findUnique({
      where: { id: data.userId }
    })
    if (requestingUser) {
      users = [...[requestingUser]]
    }
    if (data.userEmails?.length) {
      const sharedUsers = await prisma.user.findMany({
        where: {
          email: { in: data.userEmails }
        }
      })
      if (sharedUsers.length) {
        users = [...users, ...sharedUsers]
      }
    }

    const collection = await prisma.collection.create({
      data: {
        name: data.name,
        description: data.description ?? '',
        users: {
          connect: { id: data.userId }
        }
      }
    })

    Promise.all(
      users.map(async (user) => {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            collections: {
              connect: {
                id: collection.id
              }
            }
          }
        })
      })
    )
    return res.status(200).json({ message: 'success', collection })
  } catch (error) {
    return res.status(500).json({ message: error, collection: null })
  }
}
