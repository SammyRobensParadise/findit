import { UserJSON } from '@clerk/nextjs/dist/types/server'
import { UserResource } from '@clerk/types/dist/user'

import { User } from '@prisma/client'

export function generateUserFromClerkAPI(user: UserJSON): User {
  return {
    id: user.id,
    name: `${user.first_name} ${user.last_name}`,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email_addresses[0].email_address,
    lastLoggedIn: new Date(user.last_sign_in_at ?? Date.now()),
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at)
  }
}

export function generateUserFromClerkSDK(user: UserResource): User {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    firstName: user.firstName ?? 'Unknown',
    lastName: user.lastName ?? 'Unknown',
    email: user.emailAddresses[0].emailAddress,
    lastLoggedIn: new Date(user.lastSignInAt ?? Date.now()),
    createdAt: new Date(user.lastSignInAt ?? Date.now()),
    updatedAt: new Date(user.updatedAt ?? Date.now())
  }
}
