import { Book, ChartAreaSmooth, Home } from '@carbon/icons-react'
import { Anchor, Box, Nav } from 'grommet'
import Link from 'next/link'

export default function Sidebar() {
  return (
    <Box
      className="sidebar"
      color="white"
      border={{ side: 'right', color: 'dark-6' }}
    >
      <Nav direction="column" pad="medium" background="neutral-2" fill>
        <Link href="/" passHref>
          <Anchor label="Home" color="white" icon={<Home size={24} />} />
        </Link>
        <Link href="/collections" passHref>
          <Anchor label="Collections" color="white" icon={<Book size={24} />} />
        </Link>
        <Link href="/stats" passHref>
          <Anchor
            label="Statistics"
            color="white"
            icon={<ChartAreaSmooth size={24} />}
          />
        </Link>
      </Nav>
    </Box>
  )
}
