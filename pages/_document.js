import Document, { Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheet } from "styled-components";
import { GTAG_MANAGER } from "../lib/gtag";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            // borrowed from https://github.com/grommet/nextjs-boilerplate
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html
        style={{
          overflowX: "hidden",
        }}
      >
        <Head>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
          <meta name="msapplication-TileColor" content="#da532c" />
          <meta name="theme-color" content="#ffffff" />
          <div
            dangerouslySetInnerHTML={{
              __html: `<script type="text/javascript">
              var _iub = _iub || [];
              _iub.csConfiguration = {"ccpaAcknowledgeOnDisplay":true,"consentOnContinuedBrowsing":false,"countryDetection":true,"enableCcpa":true,"floatingPreferencesButtonDisplay":"bottom-right","floatingPreferencesButtonIcon":false,"gdprAppliesGlobally":false,"invalidateConsentWithoutLog":true,"lang":"pt-BR","perPurposeConsent":true,"siteId":2762124,"whitelabel":false,"cookiePolicyId":26392272,"floatingPreferencesButtonCaption":true, "banner":{ "acceptButtonCaptionColor":"#FFFFFF","acceptButtonColor":"#7D4CDB","acceptButtonDisplay":true,"backgroundColor":"#FFFFFF","brandBackgroundColor":"#FFFFFF","brandTextColor":"#000000","closeButtonDisplay":false,"customizeButtonCaptionColor":"#4D4D4D","customizeButtonColor":"#DADADA","customizeButtonDisplay":true,"explicitWithdrawal":true,"listPurposes":true,"logo":null,"position":"float-bottom-left","rejectButtonCaptionColor":"#FFFFFF","rejectButtonColor":"#7D4CDB","rejectButtonDisplay":true,"textColor":"#000000" }};
              </script>
              <script type="text/javascript" src="//cdn.iubenda.com/cs/ccpa/stub.js"></script>
              <script type="text/javascript" src="//cdn.iubenda.com/cs/iubenda_cs.js" charset="UTF-8" async></script>`,
            }}
          />
        </Head>
        <body
          style={{
            margin: "unset",
          }}
        >
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
