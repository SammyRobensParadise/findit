import { UserJSON } from '@clerk/nextjs/dist/api'
import { Collection, Item, Keyword, User } from '@prisma/client'

export type __clerk_ssr_state = {
  sessionClaims: Record<string, unknown>
  sessionId: string
  user: UserJSON
  userId: string
}

export type ClerkState = {
  __clerk_ssr_state: __clerk_ssr_state
}

export interface CollectionWithItemCount extends Collection {
  _count: {
    items: number
  }
}

export type UserWithCollections = User & {
  collections: CollectionWithItemCount[]
}

export type ItemWithKeywords = Item & {
  keywords: Keyword[]
}

export type ItemWithCollectionAndUserAndKeywords = Item & {
  Collection: Collection & { User: User }
  keywords: Keyword[]
}

export type ItemServerQuery = {
  collectionId: string
  keywords: string | string[]
  text: string
}

export type ExportableItem = {
  name: string
  description: string | null
  id: number
  keywords: string
  collection: string | undefined
  collectionId: string | undefined
  createdAt: Date
  updatedAt: Date
}
