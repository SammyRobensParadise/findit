import { useKeywords } from '@/hooks/keywords'
import { UserWithCollections } from '@/types'
import { Collection, Keyword } from '@prisma/client'
import {
  Form,
  FormField,
  Select,
  SelectMultiple,
  Box,
  Text,
  Tag,
  TextInput,
  Button,
  FormExtendedEvent
} from 'grommet'
import { useRouter } from 'next/router'
import queryString from 'query-string'

import { useEffect, useState } from 'react'

export default function SearchForm({
  user,
  searchDisplay = 'new-page'
}: {
  user: UserWithCollections
  searchDisplay?: 'new-page' | 'current-page'
}) {
  const [collection, setCollection] = useState<Partial<Collection>>()
  const { keywords } = useKeywords({
    userId: user.id,
    collectionId: collection?.id
  })
  const [keywordsValues, setKeywordsValues] = useState<Keyword[]>([])
  const [keywordsOptions, setKeywordOptions] = useState(keywords)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    setKeywordOptions(keywords)
  }, [keywords])

  function resetForm() {
    setCollection(undefined)
    setKeywordsValues([])
    setKeywordOptions([])
    setSearchTerm('')
  }

  async function Submit(
    event: FormExtendedEvent<{
      collection: Collection
      keywords: Keyword[]
      text: string
    }>
  ) {
    const { value } = event
    const query = {
      collectionId: value.collection.id,
      keywords: value.keywords.map((keyword) => keyword.id),
      text: value.text
    }
    const search = queryString.stringify(query)
    if (searchDisplay === 'new-page') {
      router.push(`/search/results?${search}`)
    }
  }

  return (
    <Form onReset={resetForm} onSubmit={Submit}>
      <FormField name="collection" label="Collection" htmlFor="collection">
        <Select
          options={user.collections}
          name="collection"
          id="collection"
          onChange={({ value }) => setCollection(value)}
        />
      </FormField>
      {keywords?.length && (
        <Box>
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
              options={keywordsOptions ?? []}
              onChange={({ value: nextValue }) => setKeywordsValues(nextValue)}
              onClose={() => setKeywordOptions(keywords)}
              onSearch={(text) => {
                const escapedText = text.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
                const exp = new RegExp(escapedText, 'i')
                const newOptions = keywords?.filter((o) => exp.test(o.name))
                setKeywordOptions(newOptions)
              }}
            />
          </FormField>
          <FormField name="text" label="Search Text" htmlFor="text">
            <TextInput
              name="text"
              id="text"
              placeholder="Search by text..."
              value={searchTerm}
              onChange={({ target: { value } }) => setSearchTerm(value)}
            />
          </FormField>
          <Box direction="row" gap="medium">
            <Button type="reset" label="Reset Form" />
            <Button type="submit" primary label="Search" />
          </Box>
        </Box>
      )}
    </Form>
  )
}
