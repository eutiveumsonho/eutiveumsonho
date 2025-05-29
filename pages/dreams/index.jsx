/** @module pages/dreams */
import { getAuthProps } from "../../lib/auth";
import {
  getLatestPublicPosts,
  getPublicPostsCount,
  getStarsByUserEmail,
  getUserById,
} from "../../lib/db/reads";
import PublicDreams from "../../containers/public-dreams";
import Head from "next/head";
import { getUserAgentProps } from "../../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { logError } from "../../lib/o11y/log";

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
    pagination: rawPagination,
    deviceType,
  } = props;

  const serverSession = JSON.parse(rawServerSession);
  const { t } = useTranslation("dashboard");

  const data = JSON.parse(rawData);
  const stars = JSON.parse(rawStars);
  const pagination = JSON.parse(rawPagination);

  return (
    <>
      <Head>
        <title>{t("discover")}</title>
      </Head>
      <PublicDreams
        serverSession={serverSession}
        data={data}
        stars={stars}
        pagination={pagination}
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
    const { page = 1 } = context.query;
    const currentPage = parseInt(page, 10);
    const limit = 20;

    const [data, stars, total] = await Promise.all([
      getLatestPublicPosts({ page: currentPage, limit }),
      getStarsByUserEmail(authProps.props.serverSession.user.email),
      getPublicPostsCount()
    ]);

    const dreams = [];

    if (data) {
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
    }

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    const pagination = {
      currentPage,
      totalPages,
      total,
      hasNextPage,
      hasPrevPage,
      limit
    };

    return {
      props: {
        serverSession: JSON.stringify(authProps.props.serverSession),
        data: JSON.stringify(dreams),
        stars: JSON.stringify(stars),
        pagination: JSON.stringify(pagination),
        ...getUserAgentProps(context),
        ...(await serverSideTranslations(context.locale, [
          "dashboard",
          "common",
        ])),
      },
    };
  } catch (error) {
    logError(error, {
      service: "web",
      pathname: "/dreams",
      component: "FindOut",
    });

    return {
      props: {
        serverSession: JSON.stringify(authProps.props.serverSession),
        data: JSON.stringify([]),
        stars: JSON.stringify([]),
        pagination: JSON.stringify({ currentPage: 1, totalPages: 0, total: 0, hasNextPage: false, hasPrevPage: false, limit: 20 }),
        ...getUserAgentProps(context),
        ...(await serverSideTranslations(context.locale, [
          "dashboard",
          "common",
        ])),
      },
    };
  }
}
