import { UserWithCollections } from '@/types'
import { useUser } from '@clerk/nextjs'
import {
  Avatar,
  Box,
  Button,
  DropButton,
  Header,
  Text,
  ResponsiveContext,
  Menu
} from 'grommet'
import { useClerk } from '@clerk/clerk-react'
import Link from 'next/link'
import {
  DocumentAdd,
  Search,
  Menu as MenuIcon,
  Book,
  Export
} from '@carbon/icons-react'
import { useRouter } from 'next/router'

export default function Navbar({ user }: { user: UserWithCollections }) {
  const { isLoaded, user: clerkUser } = useUser()
  const router = useRouter()
  const { signOut } = useClerk()
  return (
    <Header
      pad="small"
      background="light-2"
      border={{ color: 'light-4', side: 'bottom' }}
    >
      <Box>
        <Link href="/item/new">
          <Button
            label="Create Item"
            size="small"
            icon={<DocumentAdd size={16} />}
          />
        </Link>
      </Box>
      <Box direction="row" gap="medium" alignContent="center">
        <Box
          direction="row"
          gap="xsmall"
          alignContent="center"
          alignSelf="center"
        >
          <Text size="small">{user.firstName[0]}</Text>
          <Text size="small">{user.lastName}</Text>
        </Box>
        <DropButton
          aria-label="Proflile Options"
          dropAlign={{ right: 'left', top: 'bottom' }}
          dropProps={{ round: 'small' }}
          dropContent={
            <Box pad="medium" gap="small">
              <Text>{user.name}</Text>
              <Text size="small">{user.email}</Text>
              <Button
                onClick={() => signOut().then(() => {})}
                label="Sign out"
              ></Button>
            </Box>
          }
        >
          {isLoaded && <Avatar src={clerkUser?.imageUrl} size="small" />}
        </DropButton>
        <ResponsiveContext.Consumer>
          {(size) =>
            size === 'small' && (
              <Menu
                dropProps={{ align: { top: 'bottom', right: 'right' } }}
                icon={<MenuIcon size={24} />}
                items={[
                  {
                    label: (
                      <Box pad="small">
                        <Text>Search Items</Text>
                      </Box>
                    ),
                    icon: (
                      <Box pad="small">
                        <Search size={24} />
                      </Box>
                    ),
                    onClick: () => router.push('/search')
                  },
                  {
                    label: (
                      <Box pad="small">
                        <Text>Collections</Text>
                      </Box>
                    ),
                    icon: (
                      <Box pad="small">
                        <Book size={24} />
                      </Box>
                    ),
                    onClick: () => router.push('/collections')
                  },
                  {
                    label: (
                      <Box pad="small">
                        <Text>Export</Text>
                      </Box>
                    ),
                    icon: (
                      <Box pad="small">
                        <Export size={24} />
                      </Box>
                    ),
                    onClick: () => router.push('/export')
                  }
                ]}
              ></Menu>
            )
          }
        </ResponsiveContext.Consumer>
      </Box>
    </Header>
  )
}
