/** @module pages */
import { getAuthProps } from "../lib/auth";

import Invite from "../containers/invite";
import { getUserAgentProps } from "../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

/**
 * The home page and landing page. This page is only accessible for logged out users.
 */
export default function Home(props) {
  const { deviceType } = props;

  return <Invite deviceType={deviceType} />;
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);

  if (authProps?.props?.serverSession) {
    const { res } = context;
    res.setHeader("location", `/${context.locale}/dreams`);
    res.statusCode = 302;
    res.end();
  }

  return {
    props: {
      ...getUserAgentProps(context),
      ...(await serverSideTranslations(context.locale, [
        "layout",
        "footer",
        "editor",
        "common",
      ])),
    },
  };
}
