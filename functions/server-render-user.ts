import prisma from '@/lib/prisma'
import { ClerkState, UserWithCollections } from '@/types'
import { generateUserFromClerkSDK } from './generate-user'

export default async function serverRenderUser(state: ClerkState) {
  const { __clerk_ssr_state: s } = state
  if (s?.userId) {
    let userWithCollections = await prisma.user.findUnique({
      where: {
        id: s.userId
      },
      include: {
        collections: {
          select: {
            name: true,
            id: true,
            description: true,
            _count: {
              select: {
                items: true
              }
            }
          }
        }
      }
    })
    if (userWithCollections) {
      const user: UserWithCollections = JSON.parse(
        JSON.stringify(userWithCollections)
      )
      return { props: { user } }
    }
    const user = generateUserFromClerkSDK(s.user)
    const hasMetadata = !!s.user.publicMetadata
    const newUser = await prisma.user.create({
      data: {
        ...user,
        ...(hasMetadata && {
          collections: {
            connect: [
              { id: s.user.publicMetadata.inital_collection_id as string }
            ]
          }
        })
      },
      include: {
        collections: {
          select: {
            name: true,
            id: true,
            description: true,
            _count: {
              select: {
                items: true
              }
            }
          }
        }
      }
    })
    if (newUser) {
      const user: UserWithCollections = JSON.parse(JSON.stringify(newUser))
      return { props: { user } }
    }
  }
  return { props: {} }
}
