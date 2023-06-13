import prisma from '@/lib/prisma'
import { UserWithCollections } from '@/types'

export async function serverRenderItem(
  itemId: number,
  user: UserWithCollections
) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { Collection: { include: { users: true } }, keywords: true }
  })
  if (item?.Collection?.users?.map((u) => u.id).includes(user.id)) {
    return { props: { item: JSON.parse(JSON.stringify(item)) } }
  }
  return { props: { item: null } }
}
