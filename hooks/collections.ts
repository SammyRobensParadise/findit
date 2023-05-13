import { Collection } from '@prisma/client'
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
    return response
  }
  return { collections: data?.collections, error, create }
}
