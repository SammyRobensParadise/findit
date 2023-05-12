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
  Tag
} from 'grommet'
import { useEffect, useState } from 'react'

export default function SearchForm({ user }: { user: UserWithCollections }) {
  const [collection, setCollection] = useState<Partial<Collection>>()
  const { keywords } = useKeywords({
    userId: user.id,
    collectionId: collection?.id
  })
  const [valueMultiple, setValueMultiple] = useState<Keyword[]>([])
  const [options, setOptions] = useState(keywords)

  useEffect(() => {
    setOptions(keywords)
  }, [keywords])

  // console.log(options)
  return (
    <Form>
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
              {valueMultiple.map((value: Keyword) => (
                <Tag
                  size="small"
                  name="Keyword"
                  value={value.name}
                  key={value.id}
                />
              ))}
            </Box>
            <SelectMultiple
              showSelectedInline
              size="medium"
              placeholder="Select multiple options"
              value={valueMultiple}
              options={options ?? []}
              onChange={({ value: nextValue }) => setValueMultiple(nextValue)}
              onClose={() => setOptions(keywords)}
              onSearch={(text) => {
                const escapedText = text.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
                const exp = new RegExp(escapedText, 'i')
                const newOptions = keywords?.filter((o) => exp.test(o.name))
                console.log(newOptions)
                setOptions(newOptions)
              }}
            />
          </FormField>
        </Box>
      )}
    </Form>
  )
}
