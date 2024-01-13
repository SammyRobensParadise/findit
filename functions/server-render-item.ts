import prisma from '@/lib/prisma'
import { UserWithCollections } from '@/types'

export async function serverRenderItem(
  itemId: number,
  user: UserWithCollections
) {
  let item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { Collection: { include: { users: true } }, keywords: true }
  })

  const itemKeywords = await prisma.keyword.findMany({
    where: {
      itemId: item?.id
    }
  })

  if (item) {
    item.keywords = itemKeywords
  }
  if (item?.Collection?.users?.map((u) => u.id).includes(user.id)) {
    return { props: { item: JSON.parse(JSON.stringify(item)) } }
  }
  return { props: { item: null } }
}
