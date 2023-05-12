import { useKeywords } from '@/hooks/keywords'
import { UserWithCollections } from '@/types'
import { Collection } from '@prisma/client'
import { Form, FormField, Select } from 'grommet'
import { useState } from 'react'

export default function SearchForm({ user }: { user: UserWithCollections }) {
  const [collection, setCollection] = useState<Partial<Collection>>()
  const { keywords } = useKeywords({
    userId: user.id,
    collectionId: collection?.id
  })
  console.log(keywords)
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
        <FormField name="keywords" label="Keywords" htmlFor="keywords">
          <Select options={keywords} name="keywords" id="keywords" multiple />
        </FormField>
      )}
    </Form>
  )
}
