import Head from 'next/head'
import { clerkClient, getAuth, buildClerkProps } from '@clerk/nextjs/server'
import { GetServerSideProps } from 'next'
import { ClerkState, UserWithCollections, __clerk_ssr_state } from '@/types'
import serverRenderUser from '@/functions/server-render-user'
import Page from '@/components/Page'
import {
  Box,
  Text,
  Button,
  Form,
  FormField,
  TextInput,
  TextArea,
  Keyboard
} from 'grommet'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { Close } from '@carbon/icons-react'

const Tag = ({ children, onRemove, ...rest }: any) => {
  const tag = (
    <Box
      direction="row"
      align="center"
      background="brand"
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

  const onEnter = () => {
    if (currentTag.length) {
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
    <Keyboard onEnter={onEnter}>
      <Box direction="row" pad={{ horizontal: 'xsmall' }} ref={boxRef} wrap>
        {value.length > 0 && renderValue()}
        <Box flex>
          <TextInput
            plain
            type="search"
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

export default function NewCollection(props: { user: UserWithCollections }) {
  const [collectionName, setCollectionName] = useState<string>('')
  const [collectionDescription, setCollectionDescription] = useState<string>('')
  const { user } = props

  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const onRemoveTag = (tag: string) => {
    const removeIndex = selectedTags.indexOf(tag)
    const newTags = [...selectedTags]
    if (removeIndex >= 0) {
      newTags.splice(removeIndex, 1)
    }
    setSelectedTags(newTags)
  }

  const onAddTag = (tag: string) => setSelectedTags([...selectedTags, tag])

  return (
    <>
      <Head>
        <title>Findit | New Collection</title>
        <meta name="description" content="Findit Home Page, Search or Create" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page user={user}>
        <Box gap="medium">
          <Text>New Collection</Text>
          <Box>
            <Form>
              <FormField
                name="name"
                label="Collection Name (required)"
                htmlFor="name"
              >
                <TextInput
                  required
                  name="name"
                  id="name"
                  placeholder="My New Collection"
                  value={collectionName}
                  onChange={({ target: { value } }) => setCollectionName(value)}
                />
              </FormField>
              <FormField
                name="description"
                label="Collection Description"
                htmlFor="description"
              >
                <TextArea
                  name="description"
                  id="description"
                  placeholder="Description"
                  value={collectionDescription}
                  onChange={({ target: { value } }) =>
                    setCollectionDescription(value)
                  }
                />
              </FormField>
              <FormField
                name="user-emails"
                label="Share via Email"
                htmlFor="user-emails"
                help={
                  <Text size="small" color="dark-2">
                    Type an email and press the <kbd>Enter</kbd> key
                  </Text>
                }
              >
                <TagInput
                  placeholder="Enter email"
                  value={selectedTags}
                  onRemove={onRemoveTag}
                  onAdd={onAddTag}
                />
              </FormField>
            </Form>
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
