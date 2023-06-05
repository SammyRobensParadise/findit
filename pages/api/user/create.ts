import { generateUserFromClerkAPI } from '@/functions/generate-user'
import prisma from '@/lib/prisma'
import { UserJSON } from '@clerk/nextjs/server'
import { User } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

interface CreateRequest extends NextApiRequest {
  body: string
}

type NewUser = UserJSON

export default async function handler(
  req: CreateRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed', user: null })
  }
  try {
    const body = JSON.parse(req.body)
    const user = body.data as NewUser
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id }
    })
    if (existingUser) {
      return res.status(200).json({ message: 'success', user: existingUser })
    } else {
      const databaseUser: User = generateUserFromClerkAPI(user)
      const dbuser = await prisma.user.create({ data: { ...databaseUser } })
      return res.status(200).json({ message: 'success', user: dbuser })
    }
  } catch (error) {
    return res.status(500).json({ message: error })
  }
}
