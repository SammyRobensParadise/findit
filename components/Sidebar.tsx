import { Book, Export, Search } from '@carbon/icons-react'
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
        <Link href="/search" passHref>
          <Box>
            <Anchor
              label="Search"
              as="div"
              color="white"
              icon={<Search size={20} />}
            />
          </Box>
        </Link>
        <Link href="/collections" passHref>
          <Box>
            <Anchor
              as="div"
              label="Collections"
              color="white"
              icon={<Book size={20} />}
            />
          </Box>
        </Link>
        <Link href="/export" passHref>
          <Box>
            <Anchor
              as="div"
              label="Export"
              color="white"
              icon={<Export size={20} />}
            />
          </Box>
        </Link>
      </Nav>
    </Box>
  )
}
