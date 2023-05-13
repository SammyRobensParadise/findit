import { PropsWithChildren } from 'react'
import { Box } from 'grommet'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { UserWithCollections } from '@/types'
export default function Page({
  children,
  user
}: PropsWithChildren<{ user: UserWithCollections }>) {
  return (
    <Box direction="row" fill="vertical">
      <Sidebar />
      <Box>
        <Navbar user={user} />
        <Box pad="medium" flex>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
