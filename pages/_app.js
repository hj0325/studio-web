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
            height: 100%;
            overflow: hidden;
          }
          
          #__next {
            width: 100%;
            height: 100%;
          }
        `}</style>
      </Head>
      <Component {...pageProps} />
    </>
  )
} 