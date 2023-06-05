import { Collection, User } from '@prisma/client'
import { toast } from 'react-toastify'
import useSWR, { mutate } from 'swr'

const fetcher = <T>(...arg: [string, Record<string, any>]): Promise<T> =>
  fetch(...arg).then((res) => res.json())

export function useCollections({ userId }: { userId: string }) {
  const { data, error } = useSWR<{
    message: string
    collections: Collection[]
  }>(`/api/user/${userId}/collections`, fetcher, {
    revalidateIfStale: true,
    revalidateOnFocus: true,
    revalidateOnReconnect: false
  })

  async function create({
    name,
    description,
    userEmails
  }: {
    name: string
    description: string
    userEmails: string[]
  }) {
    const res = await fetch('/api/collections/create', {
      method: 'POST',
      body: JSON.stringify({ data: { name, description, userEmails, userId } })
    })

    const response = await res.json()

    if (response.message === 'success') {
      toast.success(`Created Collection ${response.collection.name}`)
    } else {
      toast.error('Unable to Create Collection')
    }
    return response
  }

  async function update({
    name,
    description,
    collectionId
  }: {
    name: string
    description: string
    collectionId: string
  }) {
    const res = await fetch(`/api/collections/${collectionId}/update`, {
      method: 'POST',
      body: JSON.stringify({
        data: { name, description, userId, collectionId }
      })
    })

    const response = await res.json()

    if (response.message === 'success') {
      mutate(`/api/user/${userId}/collections`)
      toast.success(`Updated Collection ${response.collection.name}`)
    } else {
      toast.error('Unable to update collection')
    }
    return response
  }

  async function remove({ collectionId }: { collectionId: string }) {
    const res = await fetch(`/api/collections/${collectionId}/delete`, {
      method: 'DELETE'
    })
    const response = await res.json()

    if (response.message === 'success') {
      toast.success(`Deleted Collection and Items`)
    } else {
      toast.error('Unable to Delete Collection')
    }
    return response
  }

  async function bulkExport({ collectionId }: { collectionId: string }) {
    const res = await fetch(`/api/collections/${collectionId}/export`, {
      method: 'POST',
      body: JSON.stringify({ data: { userId, collectionId } })
    })

    const response = await res.json()
    if (response.message === 'success') {
      toast.success(
        `Collection: ${response.collection.name} available to download`
      )
    } else {
      toast.error('Unable to Export Collection')
    }
    return response
  }

  async function users({ collectionId }: { collectionId: string }): Promise<{
    message: string
    users: User[]
  }> {
    const res = await fetch(
      `/api/collections/${collectionId}/users?userId=${userId}`
    )
    const response = await res.json()
    return response
  }

  return {
    collections: data?.collections,
    error,
    create,
    remove,
    bulkExport,
    update,
    users
  }
}
