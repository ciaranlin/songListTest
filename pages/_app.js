import '../styles/yu.css';
import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'

// Toast styles (global)
import 'react-toastify/dist/ReactToastify.css'

import Head from 'next/head'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import { getMergedConfigClient } from '../lib/siteConfigStore'

import { ToastContainer } from 'react-toastify'

function MyApp ({ Component, pageProps }) {
  const [siteConfig, setSiteConfig] = useState(null);

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


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const merged = await getMergedConfigClient();
        if (!mounted) return;
        setSiteConfig(merged);

        // 主题色写入 CSS 变量
        const theme = merged?.Theme || {};
        const root = document.documentElement;
        if (theme.mainBg) root.style.setProperty("--main-bg", theme.mainBg);
        if (theme.yuBg) root.style.setProperty("--yu-bg", theme.yuBg);
        if (theme.configBg) root.style.setProperty("--config-bg", theme.configBg);
        if (theme.accent) root.style.setProperty("--accent", theme.accent);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Head>
        <link rel="icon" href={siteConfig?.FaviconImage || "/favicon.ico"} />
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
