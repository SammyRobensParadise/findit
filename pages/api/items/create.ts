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
    const data = body.data as NewItem

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { collections: true }
    })

    const collection = user?.collections.find(
      (collection) => collection.id === data.collectionId
    )

    if (collection) {
      const initItem = await prisma.item.create({
        data: {
          name: data.name,
          description: data.description,
          collectionId: data.collectionId
        }
      })
      Promise.all(
        data.keywords.map(async (keyword) => {
          const kw = await prisma.keyword.findUnique({
            where: {
              id: keyword.id
            }
          })
          let newKeyword = keyword
          if (!kw) {
            newKeyword = await prisma.keyword.create({
              data: {
                ...keyword
              }
            })
          } else {
            newKeyword = await prisma.keyword.update({
              where: {
                id: kw.id
              },
              data: {
                itemId: initItem.id
              }
            })
          }
          await prisma.item.update({
            where: { id: initItem.id },
            data: {
              keywords: {
                connect: {
                  id: newKeyword.id
                }
              }
            }
          })
        })
      )

      const item = await prisma.item.findUnique({
        where: {
          id: initItem.id
        },
        include: {
          keywords: true
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
