import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

type ExportCollection = {
  collectionId: string
  userId: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ messag: 'Method Not Allowed' })
  }
  try {
    const { collectionId } = req.query
    const body = JSON.parse(req.body)
    const data = body.data as ExportCollection

    if (typeof collectionId === 'string') {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        include: { collections: true }
      })
      const collection = user?.collections.find(
        (collection) => collection.id === data.collectionId
      )
      if (collection) {
        const items = await prisma.item.findMany({
          where: {
            collectionId
          },
          include: {
            keywords: true,
            Collection: true
          },
          orderBy: { name: 'asc' }
        })
        const itemsToExport = items.map((item) => ({
          name: item?.name || '',
          description: item?.description || '',
          id: item?.id || '',
          keywords: item?.keywords.map((k) => k.name).toString() || '',
          collection: item?.Collection?.name || '',
          collectionId: item?.Collection?.id || '',
          createdAt: item?.createdAt || '',
          updatedAt: item?.updatedAt || ''
        }))

        return res.status(200).json({
          message: 'success',
          items: itemsToExport,
          collection: collection
        })
      } else {
        return res
          .status(403)
          .json({ message: 'Permision Denied', items: null, collection: null })
      }
    }
    return res.status(400).json({
      message: 'Bad Request',
      items: null,
      collection: null
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: error, items: null, collection: null })
  }
}
