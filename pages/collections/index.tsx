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
  Tag,
  Menu,
  Tip
} from 'grommet'
import { useContext } from 'react'
import Link from 'next/link'
import {
  Add,
  Launch,
  OverflowMenuVertical,
  Search,
  TrashCan
} from '@carbon/icons-react'
import { useCollections } from '@/hooks/collections'
import { useRouter } from 'next/router'

export default function Collections(props: { user: UserWithCollections }) {
  const { user } = props
  const size = useContext(ResponsiveContext)
  const { remove } = useCollections({ userId: user.id })
  const router = useRouter()

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
          <Anchor
            href="/collections/new"
            label="New Collection"
            icon={<Add size={16} />}
          />
          <Box>
            <Grid columns={size !== 'small' ? 'small' : '100%'} gap="small">
              {user.collections.map((collection, index) => (
                <Card key={index} border>
                  <CardHeader pad="small">
                    <Text>{collection.name}</Text>
                    <Menu
                      icon={<OverflowMenuVertical size={16} />}
                      items={[
                        {
                          label: (
                            <Tip
                              content={
                                <Text size="small">
                                  Delete Collection. This action cannot be
                                  undone.
                                </Text>
                              }
                            >
                              <Text>Delete</Text>
                            </Tip>
                          ),
                          icon: <TrashCan size={20} color="#FF4040" />,
                          onClick: async () => {
                            const response = await remove({
                              collectionId: collection.id
                            })
                            if (response.message === 'success') {
                              router.replace(router.asPath)
                            }
                          }
                        },
                        {
                          label: <Text>Open in New Window</Text>,
                          icon: <Launch size={20} />,
                          onClick: () =>
                            router.push(`/collections/${collection.id}`)
                        }
                      ]}
                    />
                  </CardHeader>
                  <CardBody gap="small" pad="small">
                    <Text size="small">{collection.description}</Text>
                    <Tag
                      name="Items"
                      value={`${collection._count.items}`}
                      size="small"
                    />
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
