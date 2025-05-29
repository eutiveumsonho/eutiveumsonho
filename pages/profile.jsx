import Head from "next/head";
import ProfilePage from "../containers/profile";
import { getAuthProps } from "../lib/auth";
import { getUserAgentProps } from "../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { logError } from "../lib/o11y/log";

/**
 * This component represents the user's profile page.
 * On this page, users can view and edit their profile information.
 *
 * @param {{ serverSession, deviceType }} props
 * @returns {JSX.Element}
 */
export default function Profile(props) {
  const { serverSession: rawServerSession, deviceType } = props;

  const { t } = useTranslation("dashboard");
  const serverSession = JSON.parse(rawServerSession);

  return (
    <>
      <Head>
        <title>{t("profile")}</title>
      </Head>
      <ProfilePage serverSession={serverSession} deviceType={deviceType} />
    </>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);

  if (!authProps.props.serverSession) {
    const { res } = context;
    res.setHeader("location", `/${context.locale}/auth/signin`);
    res.statusCode = 302;
    res.end();
  }

  try {
    return {
      props: {
        serverSession: JSON.stringify(authProps.props.serverSession),
        ...getUserAgentProps(context),
        ...(await serverSideTranslations(context.locale, [
          "dashboard",
          "common",
        ])),
      },
    };
  } catch (error) {
    logError(error, {
      service: "db",
      pathname: "/profile",
      component: "Profile",
    });

    return {
      props: {
        serverSession: JSON.stringify(authProps.props.serverSession),
        ...getUserAgentProps(context),
        ...(await serverSideTranslations(context.locale, [
          "dashboard",
          "common",
        ])),
      },
    };
  }
}