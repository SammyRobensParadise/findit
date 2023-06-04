import Head from 'next/head'
import { useRouter } from 'next/router'
import { Box, Spinner } from 'grommet'
import { SignedOut, SignedIn } from '@clerk/nextjs'
import React from 'react'
import { useEffect } from 'react'
import type { NextPage } from 'next'
import UserSignIn from '../components/UserSignIn'

const Home: NextPage = () => {
  return (
    <Box fill>
      <SignedOut>
        <UserSignIn />
      </SignedOut>
      <SignedIn>
        <Suspense />
      </SignedIn>
    </Box>
  )
}

const Suspense = () => {
  const router = useRouter()
  useEffect(() => {
    router.replace('/search')
  }, [router])

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Head>
        <title>Findit</title>
        <meta name="description" content="Findit. Your homepage" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box align="center">
        <Spinner size="xlarge" />
      </Box>
    </div>
  )
}
export default Home
