import { PageContent } from "grommet";
import Head from "next/head";
import Layout from "../components/layout";
import { getAuthProps } from "../lib/auth";
import { getUserAgentProps } from "../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { CookiesPolicy } from "../lib/legal/cookies-policy";

export default function CookiesPolicyPage(props) {
  const { serverSession: rawServerSession, deviceType } = props;
  const { t } = useTranslation("footer");
  const { locale } = useRouter();

  const serverSession = JSON.parse(rawServerSession);

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
        <CookiesPolicy />
      </PageContent>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);

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
