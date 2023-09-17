import { PageContent } from "grommet";
import Head from "next/head";
import Layout from "../components/layout";
import { getAuthProps } from "../lib/auth";
import { logReq } from "../lib/middleware";
import { getUserAgentProps } from "../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

export default function CookiesPolicy(props) {
  const { serverSession: rawServerSession, deviceType } = props;
  const { t } = useTranslation("footer");
  const { locale } = useRouter();

  const serverSession = JSON.parse(rawServerSession);

  const cookiesPolicies = {
    en: '<a href="https://www.iubenda.com/privacy-policy/70195735/cookie-policy" class="iubenda-nostyle no-brand iubenda-noiframe iubenda-embed iubenda-noiframe iub-body-embed" title="Cookie Policy">Cookie Policy</a><script type="text/javascript">(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);</script>',
    pt: '<a href="https://www.iubenda.com/privacy-policy/26392272/cookie-policy" class="iubenda-nostyle no-brand iubenda-noiframe iubenda-embed iub-no-markup iubenda-noiframe iub-body-embed" title="Política de Cookies">Política de Cookies</a><script type="text/javascript">(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);</script>',
    undefined:
      '<a href="https://www.iubenda.com/privacy-policy/26392272/cookie-policy" class="iubenda-nostyle no-brand iubenda-noiframe iubenda-embed iub-no-markup iubenda-noiframe iub-body-embed" title="Política de Cookies">Política de Cookies</a><script type="text/javascript">(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);</script>',
    es: '<a href="https://www.iubenda.com/privacy-policy/63047876/cookie-policy" class="iubenda-nostyle no-brand iubenda-noiframe iubenda-embed iubenda-noiframe iub-body-embed" title="Política de Cookies">Política de Cookies</a><script type="text/javascript">(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);</script>',
  };

  return (
    <Layout serverSession={serverSession} deviceType={deviceType}>
      <Head>
        <title>{t("cookies")}</title>
        <meta name="description" content={t("cookies")} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageContent
        justify="center"
        align="center"
        flex
        style={{
          minHeight: "100vh",
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: cookiesPolicies[locale]
              ? cookiesPolicies[locale]
              : cookiesPolicies["en"],
          }}
        />
      </PageContent>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);
  logReq(context.req, context.res);

  if (authProps.props.serverSession) {
    return {
      props: {
        ...getUserAgentProps(context),
        ...(await serverSideTranslations(context.locale, [
          "footer",
          "layout",
          "common",
        ])),
      },
    };
  }

  return {
    props: {
      serverSession: JSON.stringify(authProps.props.serverSession),
      ...getUserAgentProps(context),
      ...(await serverSideTranslations(context.locale, [
        "footer",
        "layout",
        "common",
      ])),
    },
  };
}
