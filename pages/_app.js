import dynamic from "next/dynamic";
import { grommet, Grommet, Notification } from "grommet";
import Script from "next/script";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { DefaultSeo } from "next-seo";
import NextNProgress from "nextjs-progressbar";
import * as gtag from "../lib/gtag";
import SEO from "../next-seo.config.js";
import { BRAND_HEX } from "../lib/config";

const WebPerformanceObserver = dynamic(() => import("../components/o11y"), {
  ssr: false,
});

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const [showGlobalNotification, setShowGlobalNotification] = useState(true);

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
          `,
        }}
      />
      <DefaultSeo {...SEO} />
      <NextNProgress color={BRAND_HEX} />
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
          {showGlobalNotification ? (
            <Notification
              status="info"
              message={"Esta é uma versão beta."}
              onClose={() => setShowGlobalNotification(false)}
              global
              actions={[
                {
                  href: "https://github.com/eutiveumsonho#quer-contribuir",
                  label: "Clique aqui para saber mais.",
                },
              ]}
            />
          ) : null}
          <Component {...pageProps} />
        </SessionProvider>
        <WebPerformanceObserver />
      </Grommet>
    </>
  );
}

export default MyApp;
