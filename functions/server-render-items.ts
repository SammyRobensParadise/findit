import prisma from '@/lib/prisma'
import {
  ItemServerQuery,
  ItemWithCollectionAndUserAndKeywords,
  ItemWithKeywords
} from '@/types'
import { Item } from '@prisma/client'

export default async function serverRenderItems(query: ItemServerQuery) {
  const { keywords, text } = query
  let keywordIds: number[] | null = null
  if (typeof keywords === 'string') {
    // its just a string
    keywordIds = [parseInt(keywords)]
  } else if (Array.isArray(keywords)) {
    // its an array of strings
    keywordIds = keywords?.map((word) => parseInt(word))
  } else {
    keywordIds = null
  }
  let Items: (Item | null)[] = []
  if (keywordIds) {
    const keywordItems = await prisma.keyword.findMany({
      where: { id: { in: keywordIds }, collectionId: query.collectionId },
      include: {
        Item: {
          include: { keywords: true, Collection: true }
        }
      }
    })
    Items = [
      ...keywordItems.map((keywordWithItem) =>
        JSON.parse(JSON.stringify(keywordWithItem.Item))
      )
    ]
  }
  if (text?.length) {
    // if postgres change text to search string
    const searchString = text.replace(' ', ' | ')
    const textSearchItems = await prisma.item.findMany({
      where: {
        description: { search: searchString },
        name: { search: searchString },
        collectionId: query.collectionId
      },
      include: {
        keywords: true,
        Collection: true
      },
      orderBy: {
        name: 'asc'
      }
    })
    Items = [
      ...Items,
      ...textSearchItems.map((textItem) => JSON.parse(JSON.stringify(textItem)))
    ]
  }
  return {
    props: { items: Items as ItemWithCollectionAndUserAndKeywords[] }
  }
}
