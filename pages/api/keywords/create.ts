import prisma from '@/lib/prisma'
import { User } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

interface CreateRequest extends NextApiRequest {
  body: string
}

type NewKeyword = {
  name: string
  userId: string
  collectionId: string
  itemId: string
}

export default async function handler(
  req: CreateRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ message: 'Method Not Allowed', keyword: null })
  }
  try {
    const body = JSON.parse(req.body)
    const data = body.data as NewKeyword

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { collections: true }
    })

    const collection = user?.collections.find(
      (collection) => collection.id === data.collectionId
    )

    if (collection) {
      const keyword = await prisma.keyword.create({
        data: {
          name: data.name,
          Collection: {
            connect: {
              id: collection.id
            }
          },
          ...(data.itemId && {
            Item: {
              connect: {
                id: parseInt(data.itemId)
              }
            }
          })
        }
      })
      return res.status(200).json({ message: 'success', keyword })
    } else {
      res.status(403).json({ message: 'Permision Denied', keyword: null })
    }
  } catch (error) {
    return res.status(500).json({ message: error })
  }
}
