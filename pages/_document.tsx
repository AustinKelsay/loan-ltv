import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Loan LTV Demo - Lightning Network</title>
        <meta name="description" content="Lightning Network Loan-to-Value ratio demo with Voltage Pay API integration" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 