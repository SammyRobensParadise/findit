import { Keyword } from '@prisma/client'
import useSWR from 'swr'

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
  return { keywords: data?.keywords, error }
}
