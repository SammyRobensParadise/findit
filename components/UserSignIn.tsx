import {
  Anchor,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Footer,
  Text
} from 'grommet'
import { useClerk } from '@clerk/nextjs'
import { FaceAdd, Login, Search } from '@carbon/icons-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function UserSignIn() {
  return (
    <Box fill background="neutral-2">
      <Box
        align="center"
        pad="large"
        fill
        direction="column"
        gap="medium"
        overflow="scroll"
      >
        <Box pad="medium">
          <SignedOutCards />
        </Box>
      </Box>
      <Footer pad="small" justify="center">
        Build with love ❤️ by:
        <Anchor href="https://sammy.world">Sammy Robens-Paradise</Anchor>
      </Footer>
    </Box>
  )
}
const SignedOutCards = () => {
  const { openSignIn, openSignUp } = useClerk()
  const router = useRouter()

  const { newuser } = router.query

  useEffect(() => {
    if (typeof newuser === 'string' && newuser === 'true') {
      openSignUp()
    }
  }, [newuser, openSignUp])

  return (
    <Card
      pad="large"
      gap="medium"
      align="center"
      width="medium"
      overflow="scroll"
      background="white"
    >
      <CardHeader>
        <Text size="large" weight="bold">
          Findit
        </Text>
      </CardHeader>
      <CardBody>
        <Text textAlign="center" size="small">
          Where you can store and find anything and everything
        </Text>
        <Box align="center" gap="small" pad="medium">
          <Button
            icon={<Login size={16} />}
            primary
            onClick={() => openSignIn()}
            label="Sign In"
            autoFocus
          />
          <Text size="xsmall">or</Text>
          <Button
            icon={<FaceAdd size={16} />}
            secondary
            label="Sign Up"
            onClick={() => openSignUp()}
          />
        </Box>
      </CardBody>
    </Card>
  )
}
