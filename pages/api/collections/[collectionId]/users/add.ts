import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import * as dotenv from 'dotenv'

interface CreateRequest extends NextApiRequest {
  body: string
}

type AddUsers = {
  emails: string[]
  collectionId: string
  userId: string
}

dotenv.config()

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
    const data = body.data as AddUsers

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { collections: true }
    })
    const hasCollection = user?.collections.find(
      (collection) => collection.id === data.collectionId
    )

    if (hasCollection) {
      let existingEmailsInDB: string[]
      let nonExistingEmailsInDB = data.emails
      let users: any = []

      const existingUsers = await prisma.user.findMany({
        where: {
          email: { in: data.emails }
        }
      })
      try {
        if (existingUsers?.length) {
          users = [...existingUsers, user]
          existingEmailsInDB = existingUsers.map((user) => user.email)
          nonExistingEmailsInDB = nonExistingEmailsInDB.filter(
            (email) => !existingEmailsInDB.includes(email)
          )
          await Promise.all(
            existingUsers.map(async (user) => {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  collections: { connect: { id: data.collectionId } }
                }
              })
            })
          )
        }
      } catch (error) {
        return res.status(500).json({ message: error, users: null })
      }
      try {
        if (nonExistingEmailsInDB?.length) {
          await Promise.all(
            nonExistingEmailsInDB.map(async (email) => {
              const res = await fetch('https://api.clerk.dev/v1/invitations', {
                method: 'POST',
                headers: {
                  'Content-type': 'application/json',
                  Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
                },
                body: JSON.stringify({
                  email_address: email,
                  public_metadata: { inital_collection_id: data.collectionId },
                  redirect_url: 'https://findit.vercel.app/collections'
                })
              })
              const response = await res.json()
              users.push(response)
              if (res.status !== 200) {
                throw new Error(response)
              }
            })
          )
        }
      } catch (error) {
        return res.status(500).json({ message: error, users: null })
      }

      return res.status(200).json({ message: 'success', users })
    } else {
      res.status(403).json({ message: 'Permision Denied', users: null })
    }
  } catch (error) {
    return res.status(500).json({ message: error, users: null })
  }
}
