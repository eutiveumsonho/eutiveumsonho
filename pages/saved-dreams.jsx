import { getAuthProps } from "../lib/auth";
import Head from "next/head";
import SavedDreams from "../containers/saved-dreams";
import { getStarredPosts, getUserById } from "../lib/db/reads";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { logError } from "../lib/o11y/log";

/**
 * Saved dreams page. This page shows the user's saved dreams.
 * The user can manage their saved dreams on this page.
 *
 * @param {{ serverSession, data }} props - The props this component gets from getServerSideProps
 */
export default function Saved(props) {
  const { serverSession: rawServerSession, data: rawData } = props;

  const serverSession = JSON.parse(rawServerSession);
  const data = JSON.parse(rawData);
  const { t } = useTranslation("dashboard");
  const { locale } = useRouter();

  return (
    <>
      <Head>
        <title>{t("saved-dreams")}</title>
      </Head>
      <SavedDreams
        serverSession={serverSession}
        data={data}
        title={t("saved-dreams")}
        page="saved-dreams"
        empty={{
          label: t("discover-dreams"),
          actionRoute: `/${locale}/dreams`,
          description: t("no-saved"),
        }}
      />
    </>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);

  if (!authProps.props.serverSession) {
    const { res, locale } = context;
    res.setHeader("location", `/${locale}/auth/signin`);
    res.statusCode = 302;
    res.end();
  }

  try {
    const data = await getStarredPosts(
      authProps.props.serverSession.user.email
    );

    const dreams = [];

    for (let dream of data) {
      if (dream.visibility === "anonymous") {
        delete dream.userId;
        dreams.push(dream);
        continue;
      }

      const user = await getUserById(dream.userId);
      dream.user = user;
      dreams.push(dream);
    }

    return {
      props: {
        serverSession: JSON.stringify(authProps.props.serverSession),
        data: JSON.stringify(dreams),
        ...(await serverSideTranslations(context.locale, [
          "dashboard",
          "common",
        ])),
      },
    };
  } catch (error) {
    logError(error, {
      service: "web",
      pathname: "/saved-dreams",
      component: "SavedDreams",
    });
  }
}
