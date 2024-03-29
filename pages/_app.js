/** @module pages/_app */
import { appWithTranslation, useTranslation } from "next-i18next";
import { Box, Button, grommet, Grommet, Heading, Layer } from "grommet";
import Script from "next/script";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { DefaultSeo } from "next-seo";
import NextNProgress from "nextjs-progressbar";
import * as gtag from "../lib/gtag";
import SEO from "../next-seo.config.js";
import { BRAND_HEX } from "../lib/config";
import CustomScripts from "../components/custom-scripts";
import ErrorBoundary from "../components/error-boundary";
import { Analytics } from "@vercel/analytics/react";
import { Close } from "grommet-icons";

/**
 * Eu tive um sonho front-end entry point.
 */
function EuTiveUmSonhoClient({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const router = useRouter();
  const [openWebViewAlert, setOpenWebViewAlert] = useState(false);
  const { t } = useTranslation("common");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent;
      const instagram = userAgent.indexOf("Instagram");
      const facebook = userAgent.indexOf("FB");

      if (instagram != -1 || facebook != -1) {
        setOpenWebViewAlert(true);
      }
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
      <Script
        id="clarity-load"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "l3gh3jr64h");
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
            {openWebViewAlert ? (
              <Layer
                position="center"
                modal
                style={{
                  zIndex: 9007199254740991,
                }}
              >
                <Box
                  pad="medium"
                  gap="small"
                  width="large"
                  overflow="auto"
                  justify="center"
                  align="center"
                  style={{
                    zIndex: 9007199254740991,
                  }}
                >
                  <Box direction="row" justify="between" width="100%">
                    <Heading level={2} margin="none" alignSelf="center">
                      🚨 {t("alert")} 🚨
                    </Heading>
                    <Button
                      icon={<Close />}
                      onClick={() => setOpenWebViewAlert(false)}
                    />
                  </Box>
                  <Heading level={3} margin="none">
                    {t("webview-alert")}
                  </Heading>
                </Box>
              </Layer>
            ) : null}
          </SessionProvider>
          <Analytics />
        </Grommet>
      </ErrorBoundary>
    </>
  );
}

export default appWithTranslation(EuTiveUmSonhoClient);
