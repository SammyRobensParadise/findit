import Head from 'next/head'
import { clerkClient, getAuth, buildClerkProps } from '@clerk/nextjs/server'
import { GetServerSideProps } from 'next'
import { ClerkState, UserWithCollections, __clerk_ssr_state } from '@/types'
import serverRenderUser from '@/functions/server-render-user'
import Page from '@/components/Page'
import {
  Box,
  Text,
  Button,
  Form,
  FormField,
  TextInput,
  TextArea,
  Spinner
} from 'grommet'
import { useEffect, useState } from 'react'

import { useCollections } from '@/hooks/collections'
import { useRouter } from 'next/router'

export default function EditCollection(props: { user: UserWithCollections }) {
  const { user } = props
  const router = useRouter()
  const { collectionId } = router.query

  const { collections, update } = useCollections({ userId: user.id })
  const currentCollection =
    collections?.find((c) => c.id == collectionId) ?? null
  const [collectionName, setCollectionName] = useState<string>(
    currentCollection?.name ?? ''
  )
  const [collectionDescription, setCollectionDescription] = useState<string>(
    currentCollection?.description ?? ''
  )

  async function handleSubmit() {
    if (
      collectionName &&
      collectionDescription &&
      typeof collectionId === 'string'
    ) {
      const response = await update({
        name: collectionName,
        description: collectionDescription,
        collectionId: collectionId
      })
      if (response.message === 'success') {
        router.push(`/collections/${collectionId}`)
      }
    }
  }

  useEffect(() => {
    if (currentCollection) {
      setCollectionName(currentCollection?.name)
      setCollectionDescription(currentCollection?.description)
    }
  }, [currentCollection])

  return currentCollection ? (
    <>
      <Head>
        <title>Findit | Edit Collection: {currentCollection?.name}</title>
        <meta name="description" content="Findit Home Page, Search or Create" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page user={user}>
        <Box gap="medium" animation="fadeIn">
          <Text>Edit Collection</Text>
          <Box>
            <Form onSubmit={handleSubmit}>
              <Box gap="small">
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
                    onChange={({ target: { value } }) =>
                      setCollectionName(value)
                    }
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
                <Box direction="row" gap="small">
                  <Button
                    label="Cancel"
                    href={`/collections/${collectionId}`}
                  />
                  <Button
                    type="submit"
                    label="Update Collection"
                    primary
                    disabled={!collectionName?.length}
                    color="neutral-2"
                  />
                </Box>
              </Box>
            </Form>
          </Box>
        </Box>
      </Page>
    </>
  ) : (
    <Page user={user}>
      <Box gap="medium" animation="fadeIn" align="center" pad="medium">
        <Spinner size="large" />
      </Box>
    </Page>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req)
  const user = userId ? await clerkClient.users.getUser(userId) : undefined
  const clerkProps = buildClerkProps(ctx.req, { user }) as ClerkState
  return serverRenderUser(clerkProps)
}
