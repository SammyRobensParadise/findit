import { Box, Button, Card, CardBody, CardHeader, Footer, Text } from 'grommet'
import { useClerk } from '@clerk/nextjs'
import { FaceAdd, Login } from '@carbon/icons-react'

export default function UserSignIn() {
  return (
    <Box fill>
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
      <Footer pad="small" justify="center"></Footer>
    </Box>
  )
}
const SignedOutCards = () => {
  const { openSignIn, openSignUp } = useClerk()
  return (
    <Card pad="large" gap="medium" align="center" width="medium">
      <CardHeader>
        <Text size="medium" weight="bolder">
          The Findit App
        </Text>
      </CardHeader>
      <CardBody gap="small">
        <Box align="center" gap="xsmall">
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
