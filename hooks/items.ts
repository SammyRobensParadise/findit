import { Collection, Item, Keyword } from '@prisma/client'
import { toast } from 'react-toastify'
import useSWR from 'swr'

const fetcher = <T>(...arg: [string, Record<string, any>]): Promise<T> =>
  fetch(...arg).then((res) => res.json())

export function useItems({ userId }: { userId: string }) {
  async function create({
    name,
    description,
    collectionId,
    keywords
  }: {
    name: string
    description: string
    collectionId: string
    keywords: Keyword[]
  }) {
    const res = await fetch('/api/items/create', {
      method: 'POST',
      body: JSON.stringify({
        data: { name, description, collectionId, userId, keywords }
      })
    })

    const response = await res.json()

    if (response.message === 'success') {
      toast.success(`Created item ${response.item.name}`)
    } else {
      toast.error('Unable to create item')
    }
    return response
  }

  async function createMany({
    data,
    collectionId
  }: {
    data: Partial<Item[]>
    collectionId: string
  }) {
    const res = await fetch('/api/items/create-many', {
      method: 'POST',
      body: JSON.stringify({ data: { items: data, userId, collectionId } })
    })
    const response = await res.json()

    if (response.message === 'success') {
      toast.success('Imported items')
    } else {
      toast.error('Unable to impot items')
    }
    return response
  }

  async function remove({ itemId }: { itemId: string }) {
    const res = await fetch(`/api/items/${itemId}/delete?userId=${userId}`, {
      method: 'DELETE'
    })
    const response = await res.json()

    if (response.message === 'success') {
      toast.success(`Deleted Item`)
    } else {
      toast.error('Unable to Delete Item')
    }
    return response
  }

  async function update({
    itemId,
    name,
    description,
    keywords,
    collectionId
  }: {
    itemId: string
    name: string
    description: string
    keywords: Keyword[]
    collectionId: string
  }) {
    const res = await fetch(`/api/items/${itemId}/update`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          name,
          description,
          keywords,
          collectionId,
          itemId,
          userId
        }
      })
    })
    const response = await res.json()
    if (response.message === 'success') {
      toast.success('Item Updated Successfully')
      return response
    } else {
      toast.error('Unable to Update Item')
      return response
    }
  }

  return { create, remove, update, createMany }
}
