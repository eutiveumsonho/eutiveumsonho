import Head from "next/head";
import MyAccountPage from "../containers/my-account";
import { getAuthProps } from "../lib/auth";
import { getUserByEmail } from "../lib/db/reads";
import { logReq } from "../lib/middleware";
import { logError } from "../lib/o11y";
import { getUserAgentProps } from "../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export default function MyAccount(props) {
  const { serverSession: rawServerSession, data: rawData } = props;

  const { t } = useTranslation("dashboard");
  const serverSession = JSON.parse(rawServerSession);
  const data = JSON.parse(rawData);

  return (
    <>
      <Head>
        <title>{t("my-account")}</title>
      </Head>
      <MyAccountPage serverSession={serverSession} data={data} />
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

  try {
    const { email } = authProps.props.serverSession.user;

    const data = await getUserByEmail(email);

    return {
      props: {
        serverSession: JSON.stringify(authProps.props.serverSession),
        data: JSON.stringify(data),
        ...getUserAgentProps(context),
        ...(await serverSideTranslations(context.locale, ["dashboard"])),
      },
    };
  } catch (error) {
    logError({
      error,
      service: "web",
      pathname: "/account",
      component: "MyAccount",
    });
  }
}