import Head from 'next/head'
import { clerkClient, getAuth, buildClerkProps } from '@clerk/nextjs/server'
import { GetServerSideProps } from 'next'
import { ClerkState, UserWithCollections, __clerk_ssr_state } from '@/types'
import serverRenderUser from '@/functions/server-render-user'
import Page from '@/components/Page'
import {
  Box,
  Card,
  Grid,
  Text,
  ResponsiveContext,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Anchor,
  Form,
  FormField,
  TextInput,
  TextArea
} from 'grommet'
import { useContext, useState } from 'react'
import Link from 'next/link'
import { Add, Search } from '@carbon/icons-react'

export default function NewCollection(props: { user: UserWithCollections }) {
  const [collectionName, setCollectionName] = useState<string>('')
  const [collectionDescription, setCollectionDescription] = useState<string>('')
  const { user } = props

  return (
    <>
      <Head>
        <title>Findit | New Collection</title>
        <meta name="description" content="Findit Home Page, Search or Create" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page user={user}>
        <Box gap="medium">
          <Text>New Collection</Text>
          <Box>
            <Form>
              <FormField
                name="name"
                label="Collection Name (required)"
                htmlFor="name"
              >
                <TextInput
                  required
                  name="name"
                  id="name"
                  placeholder="My New Collection"
                  value={collectionName}
                  onChange={({ target: { value } }) => setCollectionName(value)}
                />
              </FormField>
              <FormField
                name="description"
                label="Collection Description"
                htmlFor="description"
              >
                <TextArea
                  name="description"
                  id="description"
                  placeholder="Description"
                  value={collectionDescription}
                  onChange={({ target: { value } }) =>
                    setCollectionDescription(value)
                  }
                />
              </FormField>
            </Form>
          </Box>
        </Box>
      </Page>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req)
  const user = userId ? await clerkClient.users.getUser(userId) : undefined
  const clerkProps = buildClerkProps(ctx.req, { user }) as ClerkState
  return serverRenderUser(clerkProps)
}
