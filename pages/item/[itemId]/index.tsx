import Head from 'next/head'
import { clerkClient, getAuth, buildClerkProps } from '@clerk/nextjs/server'
import { GetServerSideProps } from 'next'
import {
  ClerkState,
  ItemWithCollectionAndUserAndKeywords,
  UserWithCollections,
  __clerk_ssr_state
} from '@/types'
import serverRenderUser from '@/functions/server-render-user'
import Page from '@/components/Page'
import { Box, Button, Card, Tag, Text } from 'grommet'
import { serverRenderItem } from '@/functions/server-render-item'
import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

export default function Results(props: {
  user: UserWithCollections
  item: ItemWithCollectionAndUserAndKeywords
}) {
  const { user, item } = props

  console.log(item)

  const componentRef = useRef(null)
  const handlePrint = useReactToPrint({
    content: () => componentRef?.current
  })

  return (
    <>
      <Head>
        <title>Findit | {item.name}</title>
        <meta name="description" content="Findit Home Page, Search or Create" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page user={user}>
        <Box gap="medium" flex="grow">
          <Card gap="medium" pad="medium" ref={componentRef}>
            <Box gap="small">
              <Text size="small">Name:</Text>
              <Text weight="bold">{item.name}</Text>
            </Box>
            <Box gap="small">
              <Text size="small">Description:</Text>
              <Text>{item.description}</Text>
            </Box>
            <Box gap="small">
              <Text size="small">Keywords:</Text>
              <Box direction="row" gap="small">
                {item.keywords?.map((word) => (
                  <Tag
                    key={word.id}
                    value={word.name}
                    name={`id ${word.id}`}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
            <Box gap="small">
              <Text size="small">Collection:</Text>
              <Text>{item.Collection.name}</Text>
            </Box>
            <Box gap="small">
              <Text size="small">Last Updated:</Text>
              <Text>
                {new Date(item.updatedAt).toLocaleDateString('en-US')}
              </Text>
            </Box>
            <Box gap="small">
              <Text size="small">Created:</Text>
              <Text>
                {new Date(item.updatedAt).toLocaleDateString('en-US')}
              </Text>
            </Box>
            <Box gap="small">
              <Text size="small">Item Number:</Text>
              <Text>{item.id}</Text>
            </Box>
          </Card>
          <Box direction="row" gap="medium" pad="small">
            <Button label="print" onClick={handlePrint} />
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
  let itemData
  if (userData?.props?.user) {
    itemData = await serverRenderItem(
      parseInt(ctx.query.itemId as string),
      userData.props.user
    )
  }

  const data = {
    props: {
      ...userData.props,
      ...itemData?.props
    }
  }
  return data
}
