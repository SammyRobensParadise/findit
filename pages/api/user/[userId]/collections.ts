import { generateUserFromClerkAPI } from '@/functions/generate-user'
import prisma from '@/lib/prisma'
import { User } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed', user: null })
  }
  try {
    const { userId } = req.query

    const collections = await prisma.collection.findMany({
      where: {
        userId: userId as string
      }
    })
    return res.status(200).json({ message: 'success', collections })
  } catch (error) {
    return res.status(500).json({ message: error })
  }
}
