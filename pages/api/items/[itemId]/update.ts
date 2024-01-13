import prisma from '@/lib/prisma'
import { Keyword } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

interface CreateRequest extends NextApiRequest {
  body: string
}

type UpdateItem = {
  name: string
  userId: string
  collectionId: string
  itemId: string
  description: string
  keywords: Keyword[]
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
    const data = body.data as UpdateItem

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { collections: true }
    })

    const collection = user?.collections.find(
      (collection) => collection.id === data.collectionId
    )

    if (collection) {
      await prisma.item.update({
        where: {
          id: parseInt(data.itemId)
        },
        data: {
          name: data.name,
          description: data.description,
          collectionId: data.collectionId
        }
      })
      Promise.all(
        data.keywords.map(async (keyword) => {
          await prisma.item.update({
            where: { id: parseInt(data.itemId) },
            data: {
              keywords: {
                connect: {
                  id: parseInt(`${keyword.id}`)
                }
              }
            }
          })
          await prisma.keyword.update({
            where: {
              id: keyword.id
            },
            data: {
              itemId: parseInt(data.itemId)
            }
          })
        })
      )

      const item = await prisma.item.findUnique({
        where: {
          id: parseInt(data.itemId)
        }
      })

      return res.status(200).json({ message: 'success', item })
    } else {
      res.status(403).json({ message: 'Permision Denied', item: null })
    }
  } catch (error) {
    return res.status(500).json({ message: error })
  }
}
