import Head from 'next/head'
import { clerkClient, getAuth, buildClerkProps } from '@clerk/nextjs/server'
import { GetServerSideProps } from 'next'
import {
  ClerkState,
  ItemServerQuery,
  ItemWithCollectionAndUserAndKeywords,
  UserWithCollections,
  __clerk_ssr_state
} from '@/types'
import serverRenderUser from '@/functions/server-render-user'
import Page from '@/components/Page'
import {
  Anchor,
  Box,
  Button,
  DataTable,
  ResponsiveContext,
  Text
} from 'grommet'
import serverRenderItems from '@/functions/server-render-items'
import { Collection } from '@prisma/client'
import prisma from '@/lib/prisma'
import { useRouter } from 'next/router'
import { Download } from '@carbon/icons-react'
import { CSVLink } from 'react-csv'
import { useContext } from 'react'

export default function Results(props: {
  user: UserWithCollections
  items: ItemWithCollectionAndUserAndKeywords[]
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
  const size = useContext(ResponsiveContext)

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
          <Box gap="medium">
            <Text color="status-critical" size="large">
              <b>No Items Found</b>
            </Text>
            <Text>
              No items matched the search criteria. The items you are looking
              for do not exist or have been deleted. If you think this is an
              error,{' '}
              <Anchor
                href={`mailto:srobensparadise@gmail.com?subject=Findit. Item Not Found&body=Item Not found at URL: ${window.location.href}`}
              >
                contact your system administrator.
              </Anchor>
            </Text>
          </Box>
        </Page>
      </>
    )
  }
  const printableItems = items.map((item) => ({
    name: item?.name,
    description: item?.description,
    id: item?.id,
    keywords: item?.keywords.map((k) => k.name).toString(),
    collection: item?.Collection.name,
    collectionId: item?.Collection.id
  }))
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
          <Box direction="row" flex="grow" gap="small">
            <CSVLink
              data={printableItems}
              filename={`item-${items.length}.csv`}
            >
              <Button
                label="Download CSV"
                size="xsmall"
                icon={<Download size={16} />}
              />
            </CSVLink>
          </Box>
          <Box
            fill="vertical"
            border={{ side: 'bottom' }}
            overflow="auto"
            animation="fadeIn"
          >
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
                    header: (
                      <Box>
                        <Text size="small">Name</Text>
                      </Box>
                    ),
                    size: size === 'small' ? 'small' : 'medium',
                    primary: true,
                    align: 'start',
                    render: ({ name }) => <Text size="small">{name}</Text>,
                    footer: (
                      <Text size="small" color="dark-2">
                        {items?.length} matching items found in{' '}
                        <b>&quot;{collectionName}&quot;</b>
                      </Text>
                    )
                  },
                  {
                    property: 'description',
                    size: size === 'small' ? 'small' : 'medium',
                    header: (
                      <Box background="white">
                        <Text size="small">Description</Text>
                      </Box>
                    ),
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
