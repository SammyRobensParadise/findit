import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  ClerkLoaded,
  WithUser
} from '@clerk/nextjs'
import { Grommet } from 'grommet'
import UserSignIn from '@/components/UserSignIn'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { ToastContainer } from 'react-toastify'
import NProgress from 'nprogress'
import Router from 'next/router'
import 'react-toastify/dist/ReactToastify.css'

const publicPages = ['/sign-up', '/sign-in']

NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 800,
  showSpinner: false
})

Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

const StyledContainer = styled(ToastContainer)`
  &&&.Toastify__toast-container {
    font-family: 'Europa';
  }
  .Toastify__toast {
  }
  .Toastify__toast-body {
  }
  .Toastify__progress-bar {
  }
`

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  return (
    <Grommet className="grommet" full>
      <ClerkProvider {...pageProps}>
        <ClerkLoaded>
          {publicPages.includes(router.pathname) ? (
            <Component {...pageProps} />
          ) : (
            <>
              <SignedIn>
                <Component {...pageProps} />
              </SignedIn>
              <SignedOut>
                <UserSignIn />
              </SignedOut>
            </>
          )}
          <ToastContainer />
          <StyledContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </ClerkLoaded>
      </ClerkProvider>
    </Grommet>
  )
}
