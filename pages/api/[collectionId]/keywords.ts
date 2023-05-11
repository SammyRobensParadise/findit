import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ messag: 'Method Not Allowed', keywords: null })
  }
  const { collectionId, userId } = req.query
  if (collectionId && userId) {
  }
  return res.status(200).json({ message: 'Success', keywords: [] })
}
