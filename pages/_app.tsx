import type { AppProps } from 'next/app'
import Head from 'next/head'
import '@/index.css'
import '@/App.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Loan Lightning Topup Visualizer</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
} 