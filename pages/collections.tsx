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
  Button
} from 'grommet'
import { useContext } from 'react'
import Link from 'next/link'
import { Search } from '@carbon/icons-react'

export default function Collections(props: { user: UserWithCollections }) {
  const { user } = props
  const size = useContext(ResponsiveContext)

  return (
    <>
      <Head>
        <title>Findit | Collections</title>
        <meta name="description" content="Findit Home Page, Search or Create" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page user={user}>
        <Box gap="medium">
          <Text>Collections {`(${user.collections.length})`}</Text>
          <Box>
            <Grid columns={size !== 'small' ? 'small' : '100%'} gap="small">
              {user.collections.map((collection, index) => (
                <Card key={index} border>
                  <CardHeader pad="small">{collection.name}</CardHeader>
                  <CardBody gap="small" pad="small">
                    <Text size="small">{collection.description}</Text>
                  </CardBody>
                  <CardFooter border={{ side: 'top' }} pad="small">
                    <Link
                      href={`/search?collectionId=${collection.id}`}
                      passHref
                    >
                      <Button
                        label="Search"
                        icon={<Search size={16} />}
                        plain
                        color="neutral-2"
                      />
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </Grid>
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
