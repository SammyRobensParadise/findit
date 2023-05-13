import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ messag: 'Method Not Allowed', keywords: null })
  }
  const { collectionId, userId } = req.query
  if (
    typeof collectionId === 'string' &&
    collectionId !== 'undefined' &&
    typeof userId === 'string'
  ) {
    const user = await prisma.user.findFirstOrThrow({
      where: {
        id: userId
      },
      include: {
        collections: true
      }
    })
    const validUser = !!user.collections.filter(
      (collection) => collection.id === collectionId
    ).length

    if (validUser) {
      const keywords = await prisma.keyword.findMany({
        where: {
          collectionId
        },
        orderBy: {
          name: 'asc'
        }
      })
      const mappedKeywords = keywords.map((keyword) => ({
        name: keyword.name,
        id: keyword.id,
        itemId: keyword.itemId,
        collectionId: keyword.collectionId
      }))
      return res
        .status(200)
        .json({ message: 'Success', keywords: mappedKeywords })
    }
    return res.status(500).json({ message: 'Bad Request', keywords: null })
  }
  return res.status(200).json({ message: 'No Data Provided', keywords: null })
}
