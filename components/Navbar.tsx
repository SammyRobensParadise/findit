import { UserWithCollections } from '@/types'
import { useUser } from '@clerk/nextjs'
import { Avatar, Box, Button, DropButton, Header, Text } from 'grommet'
import { useClerk } from '@clerk/clerk-react'

export default function Navbar({ user }: { user: UserWithCollections }) {
  const { isLoaded, user: clerkUser } = useUser()
  const { signOut } = useClerk()
  return (
    <Header
      pad="small"
      background="light-2"
      border={{ color: 'light-4', side: 'bottom' }}
    >
      <Box></Box>
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
              <Button onClick={signOut} label="Sign out"></Button>
            </Box>
          }
        >
          {isLoaded && <Avatar src={clerkUser?.profileImageUrl} size="small" />}
        </DropButton>
      </Box>
    </Header>
  )
}
