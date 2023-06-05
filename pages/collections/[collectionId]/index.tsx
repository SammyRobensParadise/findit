import Head from 'next/head'
import { clerkClient, getAuth, buildClerkProps } from '@clerk/nextjs/server'
import { GetServerSideProps } from 'next'
import { ClerkState, UserWithCollections, __clerk_ssr_state } from '@/types'
import serverRenderUser from '@/functions/server-render-user'
import Page from '@/components/Page'
import {
  Box,
  Card,
  Text,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Tag,
  Menu,
  Tip
} from 'grommet'
import Link from 'next/link'
import {
  DocumentAdd,
  Edit,
  ImportExport,
  OverflowMenuVertical,
  Search,
  TrashCan
} from '@carbon/icons-react'
import { useCollections } from '@/hooks/collections'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { User } from '@prisma/client'

export default function Collections(props: { user: UserWithCollections }) {
  const { user } = props
  const { remove, users } = useCollections({ userId: user.id })
  const router = useRouter()
  const [collectionUsrs, setUsers] = useState<User[]>([])

  const { collectionId } = router.query

  const collection = user.collections.find(
    (collection) => collection.id === collectionId
  )

  useEffect(() => {
    async function fetchUsers() {
      if (typeof collectionId === 'string') {
        const collectionUsers = await users({ collectionId })
        console.log(collectionUsers)
      }
    }
    fetchUsers()
  }, [collectionId, users])

  return (
    <>
      <Head>
        <title>Findit | {collection?.name}</title>
        <meta name="description" content="Findit Home Page, Search or Create" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page user={user}>
        <Box gap="medium">
          <Text>Collection: {collection?.name}</Text>
          <Box>
            {collection && (
              <Card border animation="zoomIn">
                <CardHeader pad="small">
                  <Text>{collection.name}</Text>
                  <Menu
                    dropProps={{ align: { top: 'bottom', right: 'right' } }}
                    icon={<OverflowMenuVertical size={16} />}
                    items={[
                      {
                        label: (
                          <Tip
                            content={<Text size="small">Edit Collection</Text>}
                          >
                            <Box pad={{ left: 'small' }}>
                              <Text>Edit</Text>
                            </Box>
                          </Tip>
                        ),
                        icon: <Edit size={20} />,
                        onClick: async () =>
                          router.push(`/collections/${collection.id}/edit`)
                      },
                      {
                        label: (
                          <Tip
                            content={
                              <Text size="small">
                                Delete Collection. This action cannot be undone.
                              </Text>
                            }
                          >
                            <Box pad={{ left: 'small' }}>
                              <Text>Delete</Text>
                            </Box>
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
                <CardFooter pad="small">
                  <Link href={`/search?collectionId=${collection.id}`} passHref>
                    <Button
                      label="Search Collection"
                      icon={<Search size={16} />}
                      plain
                      color="neutral-2"
                    />
                  </Link>
                  <Link
                    href={`/item/new?collectionId=${collection.id}`}
                    passHref
                  >
                    <Button
                      a11yTitle="Create Item"
                      label="Create Item"
                      icon={<DocumentAdd size={16} />}
                      color="neutral-2"
                      plain
                    />
                  </Link>
                  <Link href={`/collections/${collection.id}/import`} passHref>
                    <Button
                      a11yTitle="Import Items"
                      label="Import Items"
                      icon={<ImportExport size={16} />}
                      color="neutral-2"
                      plain
                    />
                  </Link>
                </CardFooter>
              </Card>
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
