import '../styles/yu.css';
import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'

// Toast styles (global)
import 'react-toastify/dist/ReactToastify.css'

import Head from 'next/head'
import Router from 'next/router'
import { useEffect } from 'react'

import { ToastContainer } from 'react-toastify'

function MyApp ({ Component, pageProps }) {
  useEffect(() => {
    const handler = (url) => {
      try {
        window._hmt.push(['_trackPageview', url]);
      } catch (e) {}
    };
    Router.events.on('routeChangeComplete', handler);
    return () => {
      Router.events.off('routeChangeComplete', handler);
    };
  }, []);

  const getAnalyticsTag = () => {
    return {
      __html: `var _hmt = _hmt || [];`,
    }
  }

  return (
    <>
      <Head>
        {/* <script dangerouslySetInnerHTML={getAnalyticsTag()} /> */}
      </Head>
      <Component {...pageProps} />
      <ToastContainer
        theme="light"
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
      />
    </>
  )
}

export default MyApp
