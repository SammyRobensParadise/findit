import { Anchor, Box, Button, Card, Footer, Text } from 'grommet'
import Image from 'next/image'

import Logo from '../public/pharmabox_logo.svg'
import { useEffect, useState } from 'react'
import { useClerk } from '@clerk/nextjs'
import { FaceAdd, Login } from '@carbon/icons-react'
import Link from 'next/link'

export default function UserSignIn() {
  const [, setLoaded] = useState<boolean>(false)

  useEffect(() => setLoaded(true), [])

  return (
    <Box className="moving-gradient" fill>
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
      <Box align="center" gap="xsmall">
        <Button
          icon={<Login size={20} />}
          fill="horizontal"
          primary
          onClick={() => openSignIn()}
          label="Sign In"
          style={{ borderRadius: '24px' }}
          // when user press enter trigger the login overlay
          autoFocus
        />
        <Text size="xsmall">Or</Text>
        <Button
          icon={<FaceAdd size={20} />}
          secondary
          label="Sign Up"
          onClick={() => openSignUp()}
          style={{ borderRadius: '24px' }}
        />
      </Box>
    </Card>
  )
}
