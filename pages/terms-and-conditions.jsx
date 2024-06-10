import { PageContent } from "grommet";
import Head from "next/head";
import Layout from "../components/layout";
import { getAuthProps } from "../lib/auth";
import { getUserAgentProps } from "../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { TermsAndConditions } from "../lib/legal/terms-and-conditions";

/**
 * Terms and Conditions page.
 *
 * @param {{ serversSession, deviceType }} props - The props this component gets from getServerSideProps
 */
export default function TermsAndConditionsPage(props) {
  const { serverSession: rawServerSession, deviceType } = props;
  const { t } = useTranslation("footer");

  const serverSession = JSON.parse(rawServerSession);

  return (
    <Layout serverSession={serverSession} deviceType={deviceType}>
      <Head>
        <title>{t("terms")}</title>
        <meta name="description" content={t("terms")} />
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
        <TermsAndConditions />
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
