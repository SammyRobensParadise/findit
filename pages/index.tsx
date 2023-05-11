import Head from 'next/head'
import { clerkClient, getAuth, buildClerkProps } from '@clerk/nextjs/server'
import { GetServerSideProps } from 'next'
import { ClerkState, UserWithCollections, __clerk_ssr_state } from '@/types'
import serverRenderUser from '@/functions/server-render-user'

export default function Home(props: { user: UserWithCollections }) {
  console.log(props.user)
  return (
    <>
      <Head>
        <title>Findit | Home</title>
        <meta name="description" content="Findit Home Page, Search or Create" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <p>home</p>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req)
  const user = userId ? await clerkClient.users.getUser(userId) : undefined
  const clerkProps = buildClerkProps(ctx.req, { user }) as ClerkState
  return serverRenderUser(clerkProps)
}
