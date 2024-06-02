/** @module pages/dreams */
import { getAuthProps } from "../../lib/auth";
import {
  getLatestPublicPosts,
  getStarsByUserEmail,
  getUserById,
} from "../../lib/db/reads";
import PublicDreams from "../../containers/public-dreams";
import Head from "next/head";
import { getUserAgentProps } from "../../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

/**
 * The home page for logged in users. This page shows a feed with the latest public dreams.
 *
 * @param {{ serverSession, data, stars, deviceType }} props - The props this component gets from getServerSideProps
 */
export default function FindOut(props) {
  const {
    serverSession: rawServerSession,
    data: rawData,
    stars: rawStars,
    deviceType,
  } = props;

  const serverSession = JSON.parse(rawServerSession);
  const { t } = useTranslation("dashboard");

  const data = JSON.parse(rawData);
  const stars = JSON.parse(rawStars);

  return (
    <>
      <Head>
        <title>{t("discover")}</title>
      </Head>
      <PublicDreams
        serverSession={serverSession}
        data={data}
        stars={stars}
        title={t("recent-dreams")}
        deviceType={deviceType}
      />
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
    const data = await getLatestPublicPosts();
    const stars = await getStarsByUserEmail(
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
        stars: JSON.stringify(stars),
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
      pathname: "/dreams",
      component: "FindOut",
    });
  }
}
