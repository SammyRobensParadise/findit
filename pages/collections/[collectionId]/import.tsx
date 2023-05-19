import Head from 'next/head'
import { clerkClient, getAuth, buildClerkProps } from '@clerk/nextjs/server'
import { GetServerSideProps } from 'next'
import { ClerkState, UserWithCollections, __clerk_ssr_state } from '@/types'
import serverRenderUser from '@/functions/server-render-user'
import Page from '@/components/Page'
import { Box, Text, Button, FileInput, Layer, FormField, Form } from 'grommet'
import Papa from 'papaparse'

import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Collections(props: { user: UserWithCollections }) {
  const { user } = props
  const router = useRouter()
  const [validatingFile, setValidationFile] = useState(false)

  const { collectionId } = router.query

  const collection = user.collections.find(
    (collection) => collection.id === collectionId
  )

  function validateFile(file: File) {
    setValidationFile(true)
  }

  return (
    <>
      <Head>
        <title>Findit | Import | {collection?.name}</title>
        <meta name="description" content="Findit Home Page, Search or Create" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page user={user}>
        <Box gap="medium">
          <Text> Import Items Into Collection: {collection?.name}</Text>
          <Box>
            {collection && (
              <Box gap="small">
                <Form onSubmit={({ value }) => console.log(value)}>
                  <FormField
                    label="Upload CSV"
                    name="file-input"
                    htmlFor="file-input"
                  >
                    <FileInput
                      accept=".csv"
                      name="file-input"
                      id="file-input"
                      confirmRemove={({ onConfirm, onCancel }) => (
                        <Layer onClickOutside={onCancel} onEsc={onCancel}>
                          <Box pad="medium" gap="medium">
                            Are you sure you want to delete this file?
                            <Box
                              direction="row"
                              align="center"
                              justify="end"
                              gap="small"
                            >
                              <Button label="Cancel" onClick={onCancel} />
                              <Button
                                label="Delete file"
                                onClick={onConfirm}
                                primary
                              />
                            </Box>
                          </Box>
                        </Layer>
                      )}
                    />
                  </FormField>
                  <Button label="Submit" type="submit" />
                </Form>
              </Box>
            )}
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
