/** @module pages/_app */
import { appWithTranslation, useTranslation } from "next-i18next";
import { Box, Button, grommet, Grommet, Heading, Layer } from "grommet";
import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { DefaultSeo } from "next-seo";
import NextNProgress from "nextjs-progressbar";
import SEO from "../next-seo.config.js";
import { BRAND_HEX } from "../lib/config.js";
import CustomScripts from "../components/custom-scripts";
import ErrorBoundary from "../components/error-boundary";
import { Close } from "grommet-icons";

/**
 * Eu tive um sonho front-end entry point.
 */
function EuTiveUmSonhoClient({
  Component,
  pageProps: { session, ...pageProps },
}) {
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

  return (
    <>
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
        </Grommet>
      </ErrorBoundary>
    </>
  );
}

export default appWithTranslation(EuTiveUmSonhoClient);
