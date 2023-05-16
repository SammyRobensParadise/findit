import { Keyword } from '@prisma/client'
import { toast } from 'react-toastify'
import useSWR, { mutate } from 'swr'

const fetcher = <T>(...arg: [string, Record<string, any>]): Promise<T> =>
  fetch(...arg).then((res) => res.json())

export function useKeywords({
  userId,
  collectionId
}: {
  userId: string
  collectionId: string | undefined
}) {
  const { data, error } = useSWR<{ message: string; keywords: Keyword[] }>(
    `/api/collections/${collectionId}/keywords?userId=${userId}`,
    fetcher,
    {
      revalidateIfStale: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: false
    }
  )

  async function create({
    name,
    collectionId,
    itemId
  }: {
    name: string
    collectionId: string
    itemId: string
  }) {
    const res = await fetch(`/api/keywords/create`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          name: name,
          collectionId: collectionId,
          userId,
          itemId
        }
      })
    })
    const response = await res.json()

    if (response.message === 'success') {
      toast.success(`Keyword ${name} created!`)
      mutate(`/api/collections/${collectionId}/keywords?userId=${userId}`)
      return response
    } else {
      toast.error('Unable to create keyword')
      return response
    }
  }

  return { keywords: data?.keywords, error, create }
}
