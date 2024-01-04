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
import { Box, Button, Card, ResponsiveContext, Tag, Text } from 'grommet'
import { serverRenderItem } from '@/functions/server-render-item'
import React, { useContext, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Download, Edit, Printer, TrashCan } from '@carbon/icons-react'
import { CSVLink } from 'react-csv'
import Link from 'next/link'
import { useItems } from '@/hooks/items'
import { useRouter } from 'next/router'

export default function Results(props: {
  user: UserWithCollections
  item: ItemWithCollectionAndUserAndKeywords
}) {
  const { user, item } = props

  const { remove } = useItems({ userId: user.id })
  const router = useRouter()
  const size = useContext(ResponsiveContext)

  const componentRef = useRef(null)
  const handlePrint = useReactToPrint({
    content: () => componentRef?.current
  })

  async function handleDelete() {
    const response = await remove({ itemId: item.id.toString() })
    if (response.message === 'success') {
      router.push('/search')
    }
  }

  const downloadableItem = {
    name: item?.name,
    description: item?.description,
    id: item?.id,
    keywords: item?.keywords.map((k) => k.name).toString(),
    collection: item?.Collection.name,
    collectionId: item?.Collection.id
  }

  if (!item) {
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
            The item you are looking for does not exist or has been deleted. If
            you think this is an error, contact your system administrator. 😢
          </Text>
        </Page>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Findit | {item.name}</title>
        <meta name="description" content="Findit Home Page, Search or Create" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page user={user}>
        <Box gap="medium" flex="grow" pad="small">
          <Box
            direction={size === 'large' ? 'row' : 'column'}
            gap={size === 'large' ? 'medium' : 'small'}
            pad="small"
            animation="fadeIn"
          >
            <Button
              size="xsmall"
              label="Print"
              onClick={handlePrint}
              icon={<Printer size={16} />}
            />
            <CSVLink data={[downloadableItem]} filename={`item-${item.id}.csv`}>
              <Box>
                <Button
                  size="xsmall"
                  label="Download CSV"
                  icon={<Download size={16} />}
                />
              </Box>
            </CSVLink>
            <Link href={`/item/${item.id}/edit`} passHref>
              <Box>
                <Button
                  size="xsmall"
                  label="Edit"
                  icon={<Edit size={16} />}
                ></Button>
              </Box>
            </Link>
            <Button
              size="xsmall"
              color="status-critical"
              label="Delete Item"
              icon={<TrashCan size={16} />}
              onClick={handleDelete}
            />
          </Box>
          <Card animation="fadeIn">
            <Box gap="medium" pad="medium" ref={componentRef}>
              <Box gap="small">
                <Text size="small">Item Name:</Text>
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
                  {new Date(item.createdAt).toLocaleDateString('en-US')}
                </Text>
              </Box>
              <Box gap="small">
                <Text size="small">Item Number:</Text>
                <Text>{item.id}</Text>
              </Box>
            </Box>
          </Card>
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
