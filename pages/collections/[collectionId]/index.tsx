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
  Tag as GrommetTag,
  Menu,
  Tip,
  Layer,
  TextInput,
  Keyboard,
  Spinner
} from 'grommet'
import Link from 'next/link'
import {
  Close,
  DocumentAdd,
  Edit,
  ImportExport,
  OverflowMenuVertical,
  Search,
  Share,
  TrashCan
} from '@carbon/icons-react'
import { useCollections } from '@/hooks/collections'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { User } from '@prisma/client'
import validateEmail from '@/functions/validate-email'

const Tag = ({ children, onRemove, ...rest }: any) => {
  const tag = (
    <Box
      direction="row"
      align="center"
      background="neutral-3"
      pad={{ horizontal: 'xsmall', vertical: 'xxsmall' }}
      margin={{ vertical: 'xxsmall' }}
      round="medium"
      {...rest}
    >
      <Text size="xsmall" margin={{ right: 'xxsmall' }}>
        {children}
      </Text>
      {onRemove && <Close size={16} />}
    </Box>
  )

  if (onRemove) {
    return <Button onClick={onRemove}>{tag}</Button>
  }
  return tag
}

const TagInput = ({ value = [], onAdd, onChange, onRemove, ...rest }: any) => {
  const [currentTag, setCurrentTag] = useState('')
  const boxRef = useRef(null)

  const updateCurrentTag = (event: any) => {
    setCurrentTag(event.target.value)
    if (onChange) {
      onChange(event)
    }
  }

  const onAddTag = (tag: string) => {
    if (onAdd) {
      onAdd(tag)
    }
  }

  const onSpace = () => {
    if (currentTag.length && validateEmail(currentTag)) {
      onAddTag(currentTag)
      setCurrentTag('')
    }
  }

  const renderValue = () =>
    value.map((v: any, index: number) => (
      <Tag
        margin="xxsmall"
        key={`${v}${index + 0}`}
        onRemove={() => onRemove(v)}
      >
        {v}
      </Tag>
    ))

  return (
    <Keyboard onSpace={onSpace}>
      <Box direction="row" pad={{ horizontal: 'xsmall' }} ref={boxRef} wrap>
        {value.length > 0 && renderValue()}
        <Box flex border round="xsmall">
          <TextInput
            plain
            type="Email"
            dropTarget={boxRef.current}
            {...rest}
            onChange={updateCurrentTag}
            value={currentTag}
            onSuggestionSelect={(event) => onAddTag(event.suggestion)}
          />
        </Box>
      </Box>
    </Keyboard>
  )
}

export default function Collections(props: { user: UserWithCollections }) {
  const { user } = props
  const { remove, users, addUsers } = useCollections({ userId: user.id })
  const router = useRouter()
  const [collectionUsers, setUsers] = useState<User[]>([])
  const [showShare, setShowShare] = useState(false)
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [addingUsers, setAddingUsers] = useState(false)

  const { collectionId } = router.query

  const collection = user.collections.find(
    (collection) => collection.id === collectionId
  )

  function onRemoveEmailTag(tag: string) {
    const removeIndex = selectedEmails.indexOf(tag)
    const newTags = [...selectedEmails]
    if (removeIndex >= 0) {
      newTags.splice(removeIndex, 1)
    }
    setSelectedEmails(newTags)
  }
  const onAddEmailTag = (tag: string) =>
    setSelectedEmails([...selectedEmails, tag])

  async function handleAddUsers() {
    if (typeof collectionId === 'string') {
      setAddingUsers(true)
      const response = await addUsers({ collectionId, emails: selectedEmails })
      setAddingUsers(false)
      if (response.message === 'success') {
        setShowShare(false)
      }
    }
  }

  useEffect(() => {
    async function fetchUsers() {
      if (typeof collectionId === 'string') {
        const usrs = await users({ collectionId })
        setUsers(() => [...usrs.users])
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
        {showShare && (
          <Layer
            position="center"
            onEsc={() => setShowShare(false)}
            onClickOutside={() => setShowShare(false)}
          >
            <Box pad="medium" gap="small" width="large">
              <Text margin="none">Share {collection?.name}</Text>
              <Text size="small">
                Share collection via email. Enter multiple emails separated by a{' '}
                <kbd>space</kbd>.
              </Text>
              {addingUsers ? (
                <Box align="center" pad="small">
                  <Spinner size="large" />
                </Box>
              ) : (
                <TagInput
                  placeholder="Enter emails"
                  value={selectedEmails}
                  onRemove={onRemoveEmailTag}
                  onAdd={onAddEmailTag}
                />
              )}
              <Box
                as="footer"
                gap="small"
                direction="row"
                align="center"
                justify="end"
                pad={{ top: 'medium', bottom: 'small' }}
              >
                <Button
                  label="Cancel"
                  onClick={() => setShowShare(false)}
                  primary
                  color="status-critical"
                />
                <Button
                  label="Share"
                  onClick={handleAddUsers}
                  disabled={!selectedEmails.length || addingUsers}
                />
              </Box>
            </Box>
          </Layer>
        )}
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
                  <GrommetTag
                    name="Items"
                    value={`${collection._count.items}`}
                    size="small"
                  />
                  <Text size="small">Users:</Text>
                  <Box direction="column" gap="small">
                    {!!collectionUsers &&
                      collectionUsers.map((user) => (
                        <Box
                          key={user.email}
                          round="medium"
                          border
                          pad="small"
                          flex="shrink"
                          style={{ width: 'fit-content' }}
                        >
                          <Text size="small">{user.email}</Text>
                        </Box>
                      ))}
                  </Box>
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
                  <Button
                    label="Share Collection"
                    icon={<Share size={16} />}
                    plain
                    color="neutral-2"
                    onClick={() => setShowShare(true)}
                  />
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
