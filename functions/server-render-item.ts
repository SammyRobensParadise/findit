import prisma from '@/lib/prisma'
import { UserWithCollections } from '@/types'

export async function serverRenderItem(
  itemId: number,
  user: UserWithCollections
) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { Collection: { include: { user: true } }, keywords: true }
  })
  if (user.id === item?.Collection?.user?.id) {
    return { props: { item: JSON.parse(JSON.stringify(item)) } }
  }
  return { props: { item: null } }
}
