import { PropsWithChildren } from 'react'
import { Box, ResponsiveContext } from 'grommet'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { UserWithCollections } from '@/types'
export default function Page({
  children,
  user
}: PropsWithChildren<{ user: UserWithCollections }>) {
  return (
    <ResponsiveContext.Consumer>
      {(size) =>
        size === 'small' ? (
          <Box
            direction="column"
            className="container"
            style={{ height: 'inherit' }}
          >
            <Box flex>
              <Navbar user={user} />
              <Box flex overflow="scroll">
                <Box pad="medium">{children}</Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            direction="row"
            className="container"
            style={{ height: 'inherit' }}
          >
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
    </ResponsiveContext.Consumer>
  )
}
