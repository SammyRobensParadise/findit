import { UserWithCollections } from '@/types'
import { Collection } from '@prisma/client'
import { Form, FormField, Select } from 'grommet'
import { useState } from 'react'

export default function SearchForm({ user }: { user: UserWithCollections }) {
  const [collection, setCollection] = useState<Partial<Collection>>()
  console.log(collection)
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
    </Form>
  )
}
