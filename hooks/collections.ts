import { Collection } from '@prisma/client'
import { toast } from 'react-toastify'
import useSWR from 'swr'

const fetcher = <T>(...arg: [string, Record<string, any>]): Promise<T> =>
  fetch(...arg).then((res) => res.json())

export function useCollections({ userId }: { userId: string }) {
  const { data, error } = useSWR<{
    message: string
    collections: Collection[]
  }>(`/api/${userId}/collections`, fetcher, {
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

  return { collections: data?.collections, error, create, remove }
}