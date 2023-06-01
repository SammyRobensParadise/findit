import Head from 'next/head'
import { clerkClient, getAuth, buildClerkProps } from '@clerk/nextjs/server'
import { GetServerSideProps } from 'next'
import {
  ClerkState,
  ItemServerQuery,
  UserWithCollections,
  __clerk_ssr_state
} from '@/types'
import serverRenderUser from '@/functions/server-render-user'
import Page from '@/components/Page'
import { Box, DataTable, Text } from 'grommet'
import serverRenderItems from '@/functions/server-render-items'
import { Collection, Item } from '@prisma/client'
import prisma from '@/lib/prisma'
import { useRouter } from 'next/router'

export default function Results(props: {
  user: UserWithCollections
  items: Item[]
  collection: Collection
  keywords: string[] | string
  text: string
}) {
  const {
    user,
    items,
    collection: { name: collectionName }
  } = props

  const router = useRouter()

  if (!items.length) {
    return (
      <>
        <Head>
          <title>Findit | Not Found</title>
          <meta
            name="description"
            content="Findit Home Page, Search or Create"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Page user={user}>
          <Text>
            The items you are looking for does not exist or has been deleted. If
            you think this is an error, contact your system administrator. 😢
          </Text>
        </Page>
      </>
    )
  }
  console.log(items)
  return (
    <>
      <Head>
        <title>Findit | Results</title>
        <meta name="description" content="Findit Home Page, Search or Create" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page user={user}>
        <Box gap="medium">
          <Text>Results</Text>
          <Box fill="vertical" border={{ side: 'bottom' }}>
            {items.length && (
              <DataTable
                a11yTitle="Items Table"
                size="medium"
                fill
                pin
                border={{
                  header: 'bottom',
                  body: {
                    color: 'light-2',
                    side: 'bottom'
                  }
                }}
                pad="small"
                columns={[
                  {
                    property: 'name',
                    header: <Text size="small">Name</Text>,
                    primary: true,
                    search: true,
                    align: 'start',
                    render: ({ name }) => <Text size="small">{name}</Text>,
                    footer: (
                      <Text size="small" color="dark-2">
                        {items?.length} matching items found in {collectionName}
                      </Text>
                    )
                  },
                  {
                    property: 'description',
                    header: <Text size="small">Description</Text>,
                    search: true,
                    render: ({ description }) => (
                      <Text size="small">{description}</Text>
                    )
                  },
                  {
                    property: 'updatedAt',
                    header: <Text size="small">Updated</Text>,
                    render: ({ updatedAt }) => (
                      <Text size="small">
                        {updatedAt &&
                          new Date(updatedAt).toLocaleDateString('en-US')}
                      </Text>
                    ),
                    size: 'small',
                    align: 'end'
                  },
                  {
                    property: 'createdAt',
                    header: <Text size="small">Created</Text>,
                    render: ({ createdAt }) => (
                      <Text size="small">
                        {createdAt &&
                          new Date(createdAt).toLocaleDateString('en-US')}
                      </Text>
                    ),
                    size: 'xsmall',
                    align: 'end'
                  }
                ]}
                data={items}
                onClickRow={({ datum }) => router.push(`/item/${datum.id}`)}
              />
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
  const userData = await serverRenderUser(clerkProps)
  const itemData = await serverRenderItems(ctx.query as ItemServerQuery)
  const collection = await prisma.collection.findUnique({
    where: {
      id: ctx.query.collectionId as string
    }
  })
  const data = {
    props: {
      ...userData.props,
      ...itemData.props,
      ...ctx.query,
      collection
    }
  }
  return data
}
