import { getAuthProps } from "../lib/auth";
import { getPosts } from "../lib/db/reads";
import Dreams from "../containers/dreams";
import Head from "next/head";
import { getUserAgentProps } from "../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

export default function MyDreams(props) {
  const { serverSession: rawServerSession, data: rawData } = props;

  const serverSession = JSON.parse(rawServerSession);
  const data = JSON.parse(rawData);

  const { t } = useTranslation("dashboard");
  const { locale } = useRouter();

  return (
    <>
      <Head>
        <title>{t("my-dreams")}</title>
      </Head>
      <Dreams
        serverSession={serverSession}
        data={data}
        title={t("my-dreams")}
        page="my-dreams"
        empty={{
          label: t("add-first-dream"),
          actionRoute: `/${locale}/publish`,
          description: `${t("dreams-listed-here")} 📚`,
        }}
      />
    </>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);

  if (!authProps.props.serverSession || !authProps.props.serverSession?.user) {
    const { res } = context;
    res.setHeader("location", `/${context.locale}/auth/signin`);
    res.statusCode = 302;
    res.end();
  }

  try {
    const { email } = authProps.props.serverSession.user;

    const data = await getPosts(email);

    return {
      props: {
        serverSession: JSON.stringify(authProps.props.serverSession),
        data: JSON.stringify(data),
        ...getUserAgentProps(context),
        ...(await serverSideTranslations(context.locale, [
          "dashboard",
          "common",
        ])),
      },
    };
  } catch (error) {
    console.error({
      error,
      service: "web",
      pathname: "/my-dreams",
      component: "MyDreams",
    });
  }
}
