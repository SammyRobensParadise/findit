import { Book, ChartAreaSmooth, Search } from '@carbon/icons-react'
import { Anchor, Box, Button, Nav } from 'grommet'
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
          <Button
            label="Search"
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
        <Link href="/stats" passHref>
          <Button
            label="Statistics"
            color="white"
            icon={<ChartAreaSmooth size={24} />}
            style={{ border: 0 }}
          />
        </Link>
      </Nav>
    </Box>
  )
}
