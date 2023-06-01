import prisma from '@/lib/prisma'
import { Keyword } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

interface CreateRequest extends NextApiRequest {
  body: string
}

type NewItem = {
  name: string
  userId: string
  collectionId: string
  description: string
  keywords: string
}

type NewItems = { items: NewItem[]; userId: string; collectionId: string }

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
    const data = body.data as NewItems

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { collections: true }
    })

    const collection = user?.collections.find(
      (collection) => collection.id === data.collectionId
    )

    if (collection) {
      const { items } = data
      const itemIds: number[] = []
      Promise.all(
        items.map(async (item) => {
          const keywords = item.keywords.split(',')
          const newItem = await prisma.item.create({
            data: {
              name: item.name,
              description: item.description,
              Collection: {
                connect: {
                  id: item.collectionId
                }
              }
            }
          })
          itemIds.push(newItem.id)
          const currentKeywords = await prisma.keyword.findMany({
            where: {
              name: { in: keywords }
            }
          })
          let keywordIntersection = keywords
          if (currentKeywords.length) {
            const namedKeywords = currentKeywords.map((kw) => kw.name)
            keywordIntersection.filter((kw) => !namedKeywords.includes(kw))
            Promise.all(
              currentKeywords.map(async (keyword) => {
                await prisma.keyword.update({
                  where: { id: keyword.id },
                  data: {
                    Item: {
                      connect: {
                        id: newItem.id
                      }
                    }
                  }
                })
              })
            )
          }
          if (keywordIntersection?.length) {
            Promise.all(
              keywordIntersection.map(async (keyword) => {
                await prisma.keyword.create({
                  data: {
                    name: keyword,
                    Item: {
                      connect: {
                        id: newItem.id
                      }
                    }
                  }
                })
              })
            )
          }
        })
      )
      const createdItems = await prisma.item.findMany({
        where: { id: { in: itemIds } }
      })
      return res.status(200).json({
        message: 'success',
        createdItems,
        itemCount: createdItems.length
      })
    } else {
      res.status(403).json({
        message: 'Permision Denied',
        itemCount: 0,
        createdItems: null
      })
    }
  } catch (error) {
    return res.status(500).json({ message: error })
  }
}
