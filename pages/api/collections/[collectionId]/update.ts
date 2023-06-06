import prisma from '@/lib/prisma'
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
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ messag: 'Method Not Allowed', keywords: null })
  }
  try {
    const body = JSON.parse(req.body)
    const data = body.data as UpdateCollection

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { collections: true }
    })

    const hasCollection = user?.collections.find(
      (collection) => collection.id === data.collectionId
    )

    if (hasCollection) {
      const collection = await prisma.collection.update({
        where: {
          id: data.collectionId
        },
        data: {
          name: data.name,
          description: data.description
        }
      })
      return res.status(200).json({ message: 'success', collection })
    } else {
      res.status(403).json({ message: 'Permision Denied', collection: null })
    }
  } catch (error) {
    return res.status(500).json({ message: error, collection: null })
  }
}
