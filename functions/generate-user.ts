import { UserJSON } from '@clerk/nextjs/dist/types/server'
import { User } from '@prisma/client'

export default function generateUserFromClerk(user: UserJSON): User {
  return {
    id: user.id,
    name: `${user.first_name} ${user.last_name}`,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email_addresses[0].email_address,
    lastLoggedIn: new Date(`${user.last_sign_in_at}`),
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at)
  }
}
