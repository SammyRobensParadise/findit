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
    <Box direction="row" className="container" style={{ height: 'inherit' }}>
      <Sidebar />
      <Box flex>
        <Navbar user={user} />
        <Box flex overflow="scroll">
          <Box pad="medium">{children}</Box>
        </Box>
      </Box>
    </Box>
  )
}
