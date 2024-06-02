import Document, { Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheet } from "styled-components";
import "../lib/backfilling";

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

  privacyControlBanner = {
    pt: `<script type="text/javascript">
    var _iub = _iub || [];
    _iub.csConfiguration = {"askConsentAtCookiePolicyUpdate":true,"countryDetection":true,"enableFadp":true,"enableLgpd":true,"enableUspr":true,"floatingPreferencesButtonCaptionColor":"#333333","floatingPreferencesButtonColor":"#FFFFFF","floatingPreferencesButtonDisplay":"anchored-bottom-right","floatingPreferencesButtonIcon":false,"gdprAppliesGlobally":false,"lang":"pt-BR","perPurposeConsent":true,"siteId":2762124,"whitelabel":false,"cookiePolicyId":26392272,"floatingPreferencesButtonCaption":true, "banner":{ "acceptButtonCaptionColor":"#FFFFFF","acceptButtonColor":"#7D4CDB","acceptButtonDisplay":true,"backgroundColor":"#FFFFFF","brandBackgroundColor":"#FFFFFF","brandTextColor":"#000000","closeButtonDisplay":false,"customizeButtonCaptionColor":"#4D4D4D","customizeButtonColor":"#DADADA","customizeButtonDisplay":true,"explicitWithdrawal":true,"listPurposes":true,"logo":"https://eutiveumsonho.com/purple-cloud.svg","position":"float-center","rejectButtonCaptionColor":"#FFFFFF","rejectButtonColor":"#7D4CDB","rejectButtonDisplay":true,"textColor":"#000000" }};
    </script>
    <script type="text/javascript" src="//cdn.iubenda.com/cs/gpp/stub.js"></script>
    <script type="text/javascript" src="//cdn.iubenda.com/cs/iubenda_cs.js" charset="UTF-8" async></script>`,
    es: `<script type="text/javascript">
    var _iub = _iub || [];
    _iub.csConfiguration = {"askConsentAtCookiePolicyUpdate":true,"countryDetection":true,"enableFadp":true,"enableLgpd":true,"enableUspr":true,"floatingPreferencesButtonCaptionColor":"#333333","floatingPreferencesButtonColor":"#FFFFFF","floatingPreferencesButtonDisplay":"anchored-bottom-right","floatingPreferencesButtonIcon":false,"gdprAppliesGlobally":false,"lang":"es","perPurposeConsent":true,"siteId":2762124,"whitelabel":false,"cookiePolicyId":63047876,"floatingPreferencesButtonCaption":true, "banner":{ "acceptButtonCaptionColor":"#FFFFFF","acceptButtonColor":"#7D4CDB","acceptButtonDisplay":true,"backgroundColor":"#FFFFFF","brandBackgroundColor":"#FFFFFF","brandTextColor":"#000000","closeButtonDisplay":false,"customizeButtonCaptionColor":"#4D4D4D","customizeButtonColor":"#DADADA","customizeButtonDisplay":true,"explicitWithdrawal":true,"listPurposes":true,"logo":"https://eutiveumsonho.com/purple-cloud.svg","position":"float-center","rejectButtonCaptionColor":"#FFFFFF","rejectButtonColor":"#7D4CDB","rejectButtonDisplay":true,"textColor":"#000000" }};
    </script>
    <script type="text/javascript" src="//cdn.iubenda.com/cs/gpp/stub.js"></script>
    <script type="text/javascript" src="//cdn.iubenda.com/cs/iubenda_cs.js" charset="UTF-8" async></script>`,
    en: `<script type="text/javascript">
    var _iub = _iub || [];
    _iub.csConfiguration = {"askConsentAtCookiePolicyUpdate":true,"countryDetection":true,"enableFadp":true,"enableLgpd":true,"enableUspr":true,"floatingPreferencesButtonCaptionColor":"#333333","floatingPreferencesButtonColor":"#FFFFFF","floatingPreferencesButtonDisplay":"anchored-bottom-right","floatingPreferencesButtonIcon":false,"gdprAppliesGlobally":false,"lang":"en","perPurposeConsent":true,"siteId":2762124,"whitelabel":false,"cookiePolicyId":70195735,"floatingPreferencesButtonCaption":true, "banner":{ "acceptButtonCaptionColor":"#FFFFFF","acceptButtonColor":"#7D4CDB","acceptButtonDisplay":true,"backgroundColor":"#FFFFFF","brandBackgroundColor":"#FFFFFF","brandTextColor":"#000000","closeButtonDisplay":false,"customizeButtonCaptionColor":"#4D4D4D","customizeButtonColor":"#DADADA","customizeButtonDisplay":true,"explicitWithdrawal":true,"listPurposes":true,"logo":"https://eutiveumsonho.com/purple-cloud.svg","position":"float-center","rejectButtonCaptionColor":"#FFFFFF","rejectButtonColor":"#7D4CDB","rejectButtonDisplay":true,"textColor":"#000000" }};
    </script>
    <script type="text/javascript" src="//cdn.iubenda.com/cs/gpp/stub.js"></script>
    <script type="text/javascript" src="//cdn.iubenda.com/cs/iubenda_cs.js" charset="UTF-8" async></script>`,
    undefined: `<script type="text/javascript">
    var _iub = _iub || [];
    _iub.csConfiguration = {"askConsentAtCookiePolicyUpdate":true,"countryDetection":true,"enableFadp":true,"enableLgpd":true,"enableUspr":true,"floatingPreferencesButtonCaptionColor":"#333333","floatingPreferencesButtonColor":"#FFFFFF","floatingPreferencesButtonDisplay":"anchored-bottom-right","floatingPreferencesButtonIcon":false,"gdprAppliesGlobally":false,"lang":"en","perPurposeConsent":true,"siteId":2762124,"whitelabel":false,"cookiePolicyId":70195735,"floatingPreferencesButtonCaption":true, "banner":{ "acceptButtonCaptionColor":"#FFFFFF","acceptButtonColor":"#7D4CDB","acceptButtonDisplay":true,"backgroundColor":"#FFFFFF","brandBackgroundColor":"#FFFFFF","brandTextColor":"#000000","closeButtonDisplay":false,"customizeButtonCaptionColor":"#4D4D4D","customizeButtonColor":"#DADADA","customizeButtonDisplay":true,"explicitWithdrawal":true,"listPurposes":true,"logo":"https://eutiveumsonho.com/purple-cloud.svg","position":"float-center","rejectButtonCaptionColor":"#FFFFFF","rejectButtonColor":"#7D4CDB","rejectButtonDisplay":true,"textColor":"#000000" }};
    </script>
    <script type="text/javascript" src="//cdn.iubenda.com/cs/gpp/stub.js"></script>
    <script type="text/javascript" src="//cdn.iubenda.com/cs/iubenda_cs.js" charset="UTF-8" async></script>`,
  };

  render() {
    return (
      <Html
        style={{
          overflowX: "hidden",
          margin: 0,
          height: "100%",
        }}
        lang={this.props.locale}
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
          <meta
            property="og:image"
            content="https://eutiveumsonho.com/api/static"
          />
          <div
            dangerouslySetInnerHTML={{
              __html: this.privacyControlBanner[this.props.locale]
                ? this.privacyControlBanner[this.props.locale]
                : this.privacyControlBanner["en"],
            }}
          />
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{ __html: this.props.browserTimingHeader }}
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
