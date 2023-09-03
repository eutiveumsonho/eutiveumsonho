import { PageContent } from "grommet";
import Head from "next/head";
import Layout from "../components/layout";
import { getAuthProps } from "../lib/auth";
import { logReq } from "../lib/middleware";
import { getUserAgentProps } from "../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

export default function TermsAndConditions(props) {
  const { serverSession: rawServerSession, deviceType } = props;
  const { locale } = useRouter();
  const { t } = useTranslation("footer");

  const serverSession = JSON.parse(rawServerSession);

  const terms = {
    en: '<a href="https://www.iubenda.com/terms-and-conditions/70195735" class="iubenda-nostyle iubenda-noiframe iubenda-embed iubenda-noiframe iub-body-embed" title="Terms and Conditions">Terms and Conditions</a><script type="text/javascript">(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);</script>',
    pt: '<a href="https://www.iubenda.com/termos-e-condicoes/26392272" class="iubenda-nostyle iubenda-noiframe iubenda-embed iubenda-noiframe iub-body-embed" title="Termos e Condições">Termos e Condições</a><script type="text/javascript">(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);</script>',
    undefined:
      '<a href="https://www.iubenda.com/termos-e-condicoes/26392272" class="iubenda-nostyle iubenda-noiframe iubenda-embed iubenda-noiframe iub-body-embed" title="Termos e Condições">Termos e Condições</a><script type="text/javascript">(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);</script>',
    es: '<a href="https://www.iubenda.com/condiciones-de-uso/63047876" class="iubenda-nostyle iubenda-noiframe iubenda-embed iubenda-noiframe iub-body-embed" title="Términos y Condiciones">Términos y Condiciones</a><script type="text/javascript">(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);</script>',
  };

  return (
    <Layout serverSession={serverSession} deviceType={deviceType}>
      <Head>
        <title>{t("terms")}</title>
        <meta
          name="description"
          content="Termos e Condições de eutiveumsonho"
        />
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
            __html: terms[locale] ? terms[locale] : terms["en"],
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
        ...(await serverSideTranslations(context.locale, ["footer", "layout"])),
      },
    };
  }

  return {
    props: {
      serverSession: JSON.stringify(authProps.props.serverSession),
      ...getUserAgentProps(context),
      ...(await serverSideTranslations(context.locale, ["footer", "layout"])),
    },
  };
}
