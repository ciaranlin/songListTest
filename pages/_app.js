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
    const pickTextColors = (hex) => {
      const h = String(hex || "").replace("#", "").trim();
      if (h.length !== 6) return { text: "rgba(255,255,255,0.92)", muted: "rgba(255,255,255,0.72)" };
      const r = parseInt(h.slice(0, 2), 16) / 255;
      const g = parseInt(h.slice(2, 4), 16) / 255;
      const b = parseInt(h.slice(4, 6), 16) / 255;
      const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
      const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      if (L < 0.45) return { text: "rgba(255,255,255,0.92)", muted: "rgba(255,255,255,0.72)" };
      return { text: "rgba(17,24,39,0.92)", muted: "rgba(17,24,39,0.70)" };
    };

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

        const mainC = pickTextColors(theme.mainBg);
        root.style.setProperty("--main-text", mainC.text);
        root.style.setProperty("--main-text-muted", mainC.muted);

        const yuC = pickTextColors(theme.yuBg || theme.mainBg);
        root.style.setProperty("--yu-text", yuC.text);
        root.style.setProperty("--yu-text-muted", yuC.muted);

        const cfgC = pickTextColors(theme.configBg || theme.mainBg);
        root.style.setProperty("--config-text", cfgC.text);
        root.style.setProperty("--config-text-muted", cfgC.muted);

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
