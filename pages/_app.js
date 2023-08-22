import dynamic from "next/dynamic";
import { grommet, Grommet } from "grommet";
import Script from "next/script";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { DefaultSeo } from "next-seo";
import NextNProgress from "nextjs-progressbar";
import * as gtag from "../lib/gtag";
import SEO from "../next-seo.config.js";
import { BRAND_HEX } from "../lib/config";
import CustomScripts from "../components/custom-scripts";
import ErrorBoundary from "../components/error-boundary";
import { Analytics } from "@vercel/analytics/react";
import { logWarn } from "../lib/o11y";

const WebPerformanceObserver = dynamic(() => import("../components/o11y"), {
  ssr: false,
});

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  useEffect(() => {
    function isInWebView() {
      if (typeof window !== "undefined") {
        const ua = window.navigator.userAgent;

        // iOS WebView check
        const isiOSWebView =
          /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua);

        // Android WebView check
        const isAndroidWebView = ua.indexOf("wv") > -1;

        return isiOSWebView || isAndroidWebView;
      }
    }

    // If its inside a WebView, open app in the default browser
    if (isInWebView()) {
      window.open(window.location.href, "_system");
    }
  }, []);

  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Script
        id="gtag-load"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_MEASUREMENT_ID}`}
      />
      <Script
        id="gtag-start"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gtag.GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
          gtag('config', '${gtag.GA_ADS_ID}', {
            page_path: window.location.pathname,
          });
          `,
        }}
      />
      <DefaultSeo {...SEO} />
      <CustomScripts />
      <NextNProgress color={BRAND_HEX} />
      <ErrorBoundary>
        <Grommet
          theme={grommet}
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            backgroundColor: "transparent",
          }}
        >
          <SessionProvider session={session}>
            <Component {...pageProps} />
          </SessionProvider>
          <WebPerformanceObserver />
          <Analytics />
        </Grommet>
      </ErrorBoundary>
    </>
  );
}

export default MyApp;
