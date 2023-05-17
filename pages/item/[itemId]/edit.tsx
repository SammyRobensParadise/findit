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
import {
  Box,
  Button,
  Card,
  Form,
  FormExtendedEvent,
  FormField,
  Select,
  SelectMultiple,
  Tag,
  Text,
  TextInput
} from 'grommet'
import { serverRenderItem } from '@/functions/server-render-item'
import React, { useEffect, useRef, useState } from 'react'
import { Collection, Keyword } from '@prisma/client'
import { useKeywords } from '@/hooks/keywords'
import { Add } from '@carbon/icons-react'
import Link from 'next/link'
import { useItems } from '@/hooks/items'
import { useRouter } from 'next/router'

export default function EditItem(props: {
  user: UserWithCollections
  item: ItemWithCollectionAndUserAndKeywords
}) {
  const { user, item } = props
  const [itemName, setItemName] = useState<string>(item?.name)
  const [itemDescription, setItemDescription] = useState<string | null>(
    item?.description
  )
  const router = useRouter()
  const itemCollectionMapping: Collection = {
    name: item.Collection.name,
    description: item.Collection.description,
    id: item.Collection.id,
    userId: item.Collection.userId
  }
  const [itemCollection, setItemCollection] = useState<Collection>(
    itemCollectionMapping
  )
  const { keywords, create } = useKeywords({
    userId: user.id,
    collectionId: item.collectionId as string
  })
  const [keywordsValues, setKeywordsValues] = useState<Keyword[]>(
    item.keywords.map((keyword) => ({
      name: keyword.name,
      id: keyword.id,
      itemId: keyword.itemId,
      collectionId: keyword.collectionId
    }))
  )
  const [keywordsOptions, setKeywordOptions] = useState(keywords)
  const [keywordSearch, setKeywordSearch] = useState<string>('')
  const { update } = useItems({ userId: user.id })

  useEffect(() => {
    setKeywordOptions(keywords)
  }, [keywords])

  async function createKeyword() {
    await create({
      name: keywordSearch,
      collectionId: itemCollection.id,
      itemId: item.id.toString()
    })
  }

  async function handleUpdate(
    event: FormExtendedEvent<{
      itemCollection: Collection
      keywords: Keyword[]
      itemDescription: string
      itemName: string
    }>
  ) {
    const response = await update({
      itemId: item.id.toString(),
      name: event.value.itemName,
      description: event.value.itemDescription,
      keywords: event.value.keywords,
      collectionId: itemCollection.id
    })
    if (response.message === 'success') {
      router.push(`/item/${item.id}`)
    }
  }

  return (
    <>
      <Head>
        <title>Findit | Edit | {item.name}</title>
        <meta name="description" content="Findit Home Page, Search or Create" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page user={user}>
        <Box gap="medium" flex="grow" pad="small" animation="fadeIn">
          <Text>Edit Item: {item.id}</Text>
          <Form onSubmit={handleUpdate}>
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
              <TextInput
                name="itemDesciption"
                id="itemDesciption"
                value={itemDescription ?? ''}
                onChange={({ target: { value } }) => setItemDescription(value)}
              />
            </FormField>
            <FormField name="keywords" label="Keywords" htmlFor="keywords">
              <Box pad="small" direction="row" gap="small">
                {keywordsValues.map((value: Keyword) => (
                  <Box key={value.id} background="light-3" round>
                    <Tag size="small" name="Keyword" value={value.name} />
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
                  const newOptions = keywords?.filter((o) => exp.test(o.name))
                  setKeywordOptions(newOptions)
                  setKeywordSearch(text)
                }}
                emptySearchMessage={
                  <Button
                    label="Add New Keyword"
                    icon={<Add size={16} />}
                    onClick={createKeyword}
                  ></Button>
                }
              />
            </FormField>
            <FormField
              name="itemCollection"
              htmlFor="itemCollection"
              label="Item Collection"
            >
              <Select
                name="itemCollection"
                id="itemCollection"
                defaultValue={itemCollection}
                options={user.collections}
                onChange={({ target: { value } }) => setItemCollection(value)}
              />
            </FormField>
            <Box direction="row" gap="small" alignContent="stretch">
              <Link href={`/item/${item.id}`} passHref>
                <Button label="Cancel" />
              </Link>
              <Button primary type="submit" label="Update Item" />
            </Box>
          </Form>
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
