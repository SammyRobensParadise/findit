import { UserJSON } from '@clerk/nextjs/dist/api'
import { Collection, User } from '@prisma/client'

export type __clerk_ssr_state = {
  sessionClaims: Record<string, unknown>
  sessionId: string
  user: UserJSON
  userId: string
}

export type ClerkState = {
  __clerk_ssr_state: __clerk_ssr_state
}

export type UserWithCollections = User & { collections: Collection[] }
