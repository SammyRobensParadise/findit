import { Book, Export, Search } from '@carbon/icons-react'
import { Box, Button, Nav } from 'grommet'
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
          <Button
            label="Search Items"
            color="white"
            icon={<Search size={24} />}
            style={{ border: 0 }}
          />
        </Link>
        <Link href="/collections" passHref>
          <Button
            label="Collections"
            color="white"
            icon={<Book size={24} />}
            style={{ border: 0 }}
          />
        </Link>
        <Link href="/export" passHref>
          <Button
            label="Export"
            color="white"
            icon={<Export size={24} />}
            style={{ border: 0 }}
          />
        </Link>
      </Nav>
    </Box>
  )
}
