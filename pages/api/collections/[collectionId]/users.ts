import prisma from '@/lib/prisma'
import { User } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

interface CreateRequest extends NextApiRequest {
  body: string
}

type UpdateCollection = {
  name: string
  description?: string
  userId: string
  collectionId: string
}

export default async function handler(
  req: CreateRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ messag: 'Method Not Allowed', keywords: null })
  }
  try {
    const { userId, collectionId } = req.query
    console.log(userId, collectionId)
    if (typeof userId === 'string' && typeof collectionId === 'string') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { collections: true }
      })

      const hasCollection = user?.collections.find(
        (collection) => collection.id === collectionId
      )
      if (hasCollection) {
        const users = await prisma.user.findMany({
          where: {
            collections: {
              some: {
                id: collectionId
              }
            }
          }
        })
        return res.status(200).json({ message: 'success', users })
      }
    } else {
      res.status(403).json({ message: 'Permision Denied', users: null })
    }
  } catch (error) {
    return res.status(500).json({ message: error, users: null })
  }
}
