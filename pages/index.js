import { getAuthProps } from "../lib/auth";

import Invite from "../containers/invite";
import { logReq } from "../lib/middleware";
import { getUserAgentProps } from "../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Home(props) {
  const { deviceType } = props;

  return <Invite deviceType={deviceType} />;
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);
  logReq(context.req, context.res);

  if (authProps?.props?.serverSession) {
    const { res } = context;
    res.setHeader("location", "/dreams");
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
      ])),
    },
  };
}
