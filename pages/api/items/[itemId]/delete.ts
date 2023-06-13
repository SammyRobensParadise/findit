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
    const { itemId, userId } = req.query
    if (typeof itemId === 'string') {
      const itemToDelete = await prisma.item.findUnique({
        where: {
          id: parseInt(itemId)
        },
        include: {
          Collection: { include: { users: true } }
        }
      })
      if (
        itemToDelete?.Collection?.users.map((u) => u.id).includes(`${userId}`)
      ) {
        const deletedItem = await prisma.item.deleteMany({
          where: {
            id: parseInt(itemId)
          }
        })
        return res.status(200).json({ message: 'success', deletedItem })
      }
    }
    return res.status(400).json({
      message: 'Bad Request',
      deletedCollection: null,
      deletedItems: null
    })
  } catch (error) {
    return res.status(500).json({ message: error, deletedItem: null })
  }
}
