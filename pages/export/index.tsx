import Head from 'next/head'
import { clerkClient, getAuth, buildClerkProps } from '@clerk/nextjs/server'
import { GetServerSideProps } from 'next'
import {
  ClerkState,
  ExportableItem,
  UserWithCollections,
  __clerk_ssr_state
} from '@/types'
import serverRenderUser from '@/functions/server-render-user'
import Page from '@/components/Page'
import { Box, Text, Button, Form, FormField, Select, Spinner } from 'grommet'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Collection } from '@prisma/client'
import { useCollections } from '@/hooks/collections'
import { CSVLink } from 'react-csv'
import { Csv } from '@carbon/icons-react'

export default function NewItem(props: { user: UserWithCollections }) {
  const { user } = props
  const [collection, setCollection] = useState<Partial<Collection>>()
  const [items, setItems] = useState<ExportableItem[]>([])
  const [loading, setLoading] = useState(false)
  const [currentCollection, setCurentCollection] = useState<Collection>()
  const { bulkExport } = useCollections({ userId: user.id })

  async function handleExport() {
    if (collection?.id) {
      setLoading(true)
      setItems([])
      const response = await bulkExport({ collectionId: collection.id })
      if (response.message === 'success') {
        setItems(response.items)
        setCurentCollection(response.collection)
      }
    }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Findit | Export Collection</title>
        <meta name="description" content="Findit Export" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page user={user}>
        <Box gap="medium">
          <Text>Export Collection to CSV</Text>
          <Box>
            {' '}
            <Form onSubmit={handleExport}>
              <FormField
                name="collection"
                label="Collection"
                htmlFor="collection"
              >
                <Select
                  options={user.collections}
                  name="collection"
                  id="collection"
                  onChange={({ value }) => setCollection(value)}
                  value={collection}
                />
              </FormField>

              <Box direction="row" gap="small" alignContent="stretch">
                <Button
                  primary
                  type="submit"
                  label="Export Collection"
                  disabled={!collection && !loading}
                />
              </Box>
            </Form>
            <Box pad={{ top: 'small' }}>
              {loading && (
                <Box align="center" gap="small">
                  <Spinner size="xlarge" />
                  <Text>Generating CSV...</Text>
                </Box>
              )}
              {!!items.length && (
                <CSVLink
                  data={items}
                  filename={`collection-${collection?.name}.csv`}
                >
                  <Button
                    label={`Download Collection "${currentCollection?.name}" as CSV`}
                    icon={<Csv size={16} />}
                    fill
                    primary
                    color="graph-1"
                  />
                </CSVLink>
              )}
            </Box>
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
