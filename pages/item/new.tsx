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
  Select,
  FormExtendedEvent,
  SelectMultiple,
  Tag,
  TextArea,
  Anchor
} from 'grommet'
import { useEffect, useState } from 'react'
import { Add } from '@carbon/icons-react'
import { useRouter } from 'next/router'
import { Collection, Keyword } from '@prisma/client'
import { useItems } from '@/hooks/items'
import { useKeywords } from '@/hooks/keywords'
import Link from 'next/link'

export default function NewItem(props: { user: UserWithCollections }) {
  const { user } = props
  const router = useRouter()
  const [collection, setCollection] = useState<Partial<Collection>>()
  const { create: createItem } = useItems({ userId: user.id })

  const { keywords, create: createKeyword } = useKeywords({
    userId: user.id,
    collectionId: collection?.id
  })
  const [keywordsValues, setKeywordsValues] = useState<Keyword[]>([])
  const [keywordsOptions, setKeywordOptions] = useState(keywords)
  const [itemName, setItemName] = useState<string>('')
  const [itemDescription, setItemDescription] = useState<string>('')
  const [keywordSearch, setKeywordSearch] = useState<string>('')

  useEffect(() => {
    setKeywordOptions(keywords)
  }, [keywords])

  useEffect(() => {
    if (router?.query?.collectionId) {
      const collection = user.collections.find(
        (c) => c.id === router?.query?.collectionId
      )
      setCollection(collection)
    }
  }, [router?.query?.collectionId, user.collections])

  async function handleCreate(
    event: FormExtendedEvent<{
      itemCollection: Collection
      keywords: Keyword[]
      itemDescription: string
      itemName: string
    }>
  ) {
    if (collection?.id) {
      const response = await createItem({
        name: itemName,
        description: itemDescription,
        collectionId: collection?.id,
        keywords: keywordsValues
      })
      if (response.message === 'success') {
        router.push(`/item/${response.item.id}`)
      }
    }
  }

  async function handleNewKeyword() {
    if (collection?.id) {
      await createKeyword({
        name: keywordSearch,
        collectionId: collection.id
      })
    }
  }

  return (
    <>
      <Head>
        <title>Findit | New Item</title>
        <meta name="description" content="Findit Home Page, Search or Create" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page user={user}>
        <Box gap="medium">
          <Text weight="bolder">New Item</Text>
          <Box border round="small" pad="small">
            <Form onSubmit={handleCreate}>
              <FormField name="itemName" htmlFor="itemName" label="Item Name">
                <TextInput
                  name="itemName"
                  id="itemName"
                  value={itemName}
                  onChange={({ target: { value } }) => setItemName(value)}
                />
              </FormField>
              <FormField
                name="itemDesciption"
                htmlFor="itemDesciption"
                label="Item Description"
              >
                <TextArea
                  name="itemDesciption"
                  id="itemDesciption"
                  value={itemDescription ?? ''}
                  onChange={({ target: { value } }) =>
                    setItemDescription(value)
                  }
                />
              </FormField>
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
              {!!keywords?.length ? (
                <FormField name="keywords" label="Keywords" htmlFor="keywords">
                  <Box pad="small" direction="row" gap="small">
                    {keywordsValues.map((value: Keyword) => (
                      <Box key={value?.id} background="light-3" round>
                        <Tag size="small" name="Keyword" value={value?.name} />
                      </Box>
                    ))}
                  </Box>
                  <SelectMultiple
                    name="keywords"
                    id="keywords"
                    showSelectedInline
                    size="medium"
                    placeholder="Select multiple options"
                    value={keywordsValues}
                    defaultValue={keywordsValues}
                    options={keywordsOptions ?? []}
                    onChange={({ value: nextValue }) =>
                      setKeywordsValues(nextValue)
                    }
                    onClose={() => setKeywordOptions(keywords)}
                    onSearch={(text) => {
                      const escapedText = text.replace(
                        /[-\\^$*+?.()|[\]{}]/g,
                        '\\$&'
                      )
                      const exp = new RegExp(escapedText, 'i')
                      const newOptions = keywords?.filter((o) =>
                        exp.test(o.name)
                      )
                      setKeywordOptions(newOptions)
                      setKeywordSearch(text)
                    }}
                    emptySearchMessage={
                      <Box gap="small">
                        <Text>No Matches Found</Text>
                        <Button
                          label="Add Keyword"
                          icon={<Add size={16} />}
                          onClick={handleNewKeyword}
                        ></Button>
                      </Box>
                    }
                  />
                </FormField>
              ) : (
                <>
                  {!!collection && (
                    <Box
                      pad="medium"
                      gap="xsmall"
                      border
                      round="xsmall"
                      margin={{ bottom: 'small' }}
                    >
                      <Text color="dark-6">
                        This collection does not have any keywords yet
                      </Text>
                      <Box direction="row" flex="shrink">
                        <TextInput
                          style={{
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0
                          }}
                          placeholder="New Keyword..."
                          onChange={({ target: { value } }) =>
                            setKeywordSearch(value)
                          }
                        />
                        <Button
                          style={{
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            borderTopRightRadius: '4px',
                            borderBottomRightRadius: '4px'
                          }}
                          size="xsmall"
                          onClick={handleNewKeyword}
                          label="Add"
                          primary
                          icon={<Add size={16} />}
                          disabled={!keywordSearch.length}
                        />
                      </Box>
                    </Box>
                  )}
                </>
              )}
              <Box direction="row" gap="small" alignContent="stretch">
                <Link href="/search" passHref>
                  <Button label="Cancel" />
                </Link>
                <Button
                  primary
                  type="submit"
                  label="Create Item"
                  disabled={!collection || !itemName || !itemDescription}
                />
              </Box>
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
