import prisma from '@/lib/prisma'
import { ClerkState, UserWithCollections } from '@/types'

export default async function serverRenderUser(state: ClerkState) {
  const { __clerk_ssr_state: s } = state
  if (s?.userId) {
    const userWithCollections = await prisma.user.findUnique({
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
    return { props: {} }
  }
  return { props: {} }
}
