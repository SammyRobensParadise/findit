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
  FileInput,
  Layer,
  FormField,
  Form,
  Spinner,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  Card
} from 'grommet'
import Papa from 'papaparse'

import { useRouter } from 'next/router'
import { ChangeEvent, useState } from 'react'
import { Item } from '@prisma/client'
import { toast } from 'react-toastify'
import { useItems } from '@/hooks/items'

export default function Collections(props: { user: UserWithCollections }) {
  const { user } = props
  const router = useRouter()
  const [validatingFile, setValidationFile] = useState(false)
  const [validationError, setValidationError] = useState(false)
  const [uploadData, setUploadData] = useState<Partial<Item[]>>([])
  const { createMany } = useItems({ userId: user.id })

  const { collectionId } = router.query

  const collection = user.collections.find(
    (collection) => collection.id === collectionId
  )

  function hasRequiredFields(fields: string[] | undefined) {
    return !!(
      fields?.includes('name') &&
      fields?.includes('description') &&
      fields.includes('keywords')
    )
  }

  function validateFile(event: ChangeEvent<HTMLInputElement> | undefined) {
    setValidationFile(true)
    setValidationError(false)
    if (event?.target.files?.length) {
      Papa.parse(event?.target?.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: ({
          data,
          meta
        }: {
          meta: Papa.ParseMeta
          data: Partial<Item[]>
        }) => {
          const hasFields: boolean = hasRequiredFields(meta.fields)
          console.log(data)
          if (!hasFields) {
            setValidationFile(false)
            setValidationError(true)
            toast.error('Invalid file.')
            return false
          } else {
            setValidationFile(false)
            setValidationError(false)
            toast.info('File formatted correctly.')
            setUploadData(data)
            return true
          }
        }
      })
    }
    setValidationFile(false)
    setValidationError(false)
  }

  async function handleSubmit() {
    if (typeof collectionId === 'string') {
      const response = await createMany({ data: uploadData, collectionId })
      if (response.message === 'success') {
        router.push(`/collections/${collectionId}`)
      }
    }
  }

  return (
    <>
      <Head>
        <title>Findit | Import | {collection?.name}</title>
        <meta name="description" content="Findit Home Page, Search or Create" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Page user={user}>
        <Box gap="medium">
          <Text>Import Items Into Collection: {collection?.name}</Text>
          <Text size="small">
            CSV files must have the the fields:{' '}
            {'"name", "description", and "keywords"'} to be imported. See the
            following example:
          </Text>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell scope="col" border="bottom" size="small">
                  <Text size="small">
                    <b>name</b>
                  </Text>
                </TableCell>
                <TableCell scope="col" border="bottom" size="small">
                  <Text size="small">
                    <b>description</b>
                  </Text>
                </TableCell>
                <TableCell scope="col" border="bottom">
                  <Text size="small">
                    <b>keywords</b>
                  </Text>
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell scope="row">
                  <Text size="small">Item 1</Text>
                </TableCell>
                <TableCell>
                  <Text size="small">Description for Item 1</Text>
                </TableCell>
                <TableCell>
                  <Text size="small">keyword1,keyword2,keyword3</Text>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell scope="row">
                  <Text size="small">Item 2</Text>
                </TableCell>
                <TableCell>
                  <Text size="small">Description for Item 1</Text>
                </TableCell>
                <TableCell>
                  <Text size="small">keyword4,keyword5,keyword6</Text>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell scope="row">
                  <Text size="small">...</Text>
                </TableCell>
                <TableCell>
                  <Text size="small">...</Text>
                </TableCell>
                <TableCell>
                  <Text size="small">...</Text>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Box>
            {collection && (
              <Card pad="medium" border>
                <Box gap="small">
                  <Form onSubmit={handleSubmit}>
                    <FormField
                      label="Upload CSV"
                      name="file-input"
                      htmlFor="file-input"
                    >
                      <FileInput
                        accept=".csv"
                        name="file-input"
                        id="file-input"
                        onChange={validateFile}
                        confirmRemove={({ onConfirm, onCancel }) => (
                          <Layer onClickOutside={onCancel} onEsc={onCancel}>
                            <Box pad="medium" gap="medium">
                              Are you sure you want to delete this file?
                              <Box
                                direction="row"
                                align="center"
                                justify="end"
                                gap="small"
                              >
                                <Button label="Cancel" onClick={onCancel} />
                                <Button
                                  label="Delete file"
                                  onClick={onConfirm}
                                  primary
                                />
                              </Box>
                            </Box>
                          </Layer>
                        )}
                      />
                    </FormField>
                    {validatingFile && (
                      <Box align="center" pad="small" gap="small">
                        <Text>Validating File...</Text>
                        <Spinner size="large" />
                      </Box>
                    )}
                    {validationError && (
                      <Box align="center" pad="medium" gap="medium">
                        <Text color="status-critical">
                          Invalid File Format. The following CSV fields are
                          required: <b>name</b>, <b>description</b>,{' '}
                          <b>keywords</b>.
                        </Text>
                      </Box>
                    )}
                    <Button
                      label="Submit"
                      type="submit"
                      disabled={!uploadData.length || validationError}
                    />
                  </Form>
                </Box>
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
