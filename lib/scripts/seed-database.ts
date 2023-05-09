import prisma from '../prisma'
import * as dotenv from 'dotenv'
import fetch from 'node-fetch'

import { UserJSON } from '@clerk/nextjs/dist/api'

dotenv.config()

const BASE_URL = `https://api.clerk.dev/v1`

/**
 * Get users from our dev database
 * @returns User[]
 */
async function getDevUsers(): Promise<UserJSON[]> {
  const response = await fetch(`${BASE_URL}/users?limit=100`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${process.env.CLERK_API_KEY}`
    }
  })
  const users = (await response.json()) as UserJSON[]
  return users
}

getDevUsers()
