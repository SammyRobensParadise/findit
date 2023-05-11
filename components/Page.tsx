import { PropsWithChildren } from 'react'
import { Box } from 'grommet'
import Sidebar from './Sidebar'
export default function Page({ children }: PropsWithChildren) {
  return (
    <Box direction="row">
      <Sidebar />
      <Box pad="medium">{children}</Box>
    </Box>
  )
}
