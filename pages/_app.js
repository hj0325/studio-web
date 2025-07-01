import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            width: 100%;
            overflow-x: hidden;
          }
        `}</style>
      </Head>
      <Component {...pageProps} />
    </>
  )
} 