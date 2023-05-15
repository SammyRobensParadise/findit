import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ messag: 'Method Not Allowed' })
  }
  try {
    const { collectionId } = req.query
    if (typeof collectionId === 'string') {
      const deletedItems = await prisma.item.deleteMany({
        where: {
          collectionId: collectionId
        }
      })
      const deletedCollection = await prisma.collection.delete({
        where: { id: collectionId }
      })
      return res
        .status(200)
        .json({ message: 'success', deletedCollection, deletedItems })
    }
    return res.status(400).json({
      message: 'Bad Request',
      deletedCollection: null,
      deletedItems: null
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: error, deletedCollection: null, deletedItems: null })
  }
}
