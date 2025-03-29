/** @module pages */
import { GetServerSideProps } from 'next';
import { getAuthProps } from "../lib/auth";
import Invite from "../containers/invite";
import { getUserAgentProps } from "../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

interface HomeProps {
  deviceType: string;
}

/**
 * The home page and landing page. This page is only accessible for logged out users.
 */
export default function Home(props: HomeProps) {
  const { deviceType } = props;
  return <Invite deviceType={deviceType} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
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
      ...(await serverSideTranslations(context.locale as string, [
        "layout",
        "footer",
        "editor",
        "common",
      ])),
    },
  };
}