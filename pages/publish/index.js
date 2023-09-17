import { getAuthProps } from "../../lib/auth";

import CreateOrEdit from "../../containers/create-or-edit";
import Head from "next/head";
import { logReq } from "../../lib/middleware";
import { getUserAgentProps } from "../../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export default function Home(props) {
  const { t } = useTranslation("editor");

  return (
    <>
      <Head>
        <title>{t("create-dream")}</title>
      </Head>
      <CreateOrEdit {...props} />
    </>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);
  logReq(context.req, context.res);

  if (!authProps.props.serverSession) {
    const { res } = context;

    res.setHeader("location", `/${context.locale}/auth/signin`);
    res.statusCode = 302;
    res.end();
  }

  return {
    props: {
      ...authProps.props,
      ...getUserAgentProps(context),
      ...(await serverSideTranslations(context.locale, [
        "dashboard",
        "editor",
        "common",
      ])),
    },
  };
}
