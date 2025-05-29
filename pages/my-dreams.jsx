import { getAuthProps } from "../lib/auth";
import { getPosts, getPostsCount } from "../lib/db/reads";
import Dreams from "../containers/dreams";
import Head from "next/head";
import { getUserAgentProps } from "../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { logError } from "../lib/o11y/log";

export default function MyDreams(props) {
  const { 
    serverSession: rawServerSession, 
    data: rawData, 
    pagination: rawPagination 
  } = props;

  const serverSession = JSON.parse(rawServerSession);
  const data = JSON.parse(rawData);
  const pagination = JSON.parse(rawPagination);

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
        pagination={pagination}
        title={t("my-dreams")}
        page="my-dreams"
        empty={{
          label: t("add-first-dream"),
          actionRoute: `/${locale}/publish`,
          description: `${t("dreams-listed-here")} 📚`,
        }}
      />
      )
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
    const { page = 1 } = context.query;
    const currentPage = parseInt(page, 10);
    const limit = 20;

    const [data, total] = await Promise.all([
      getPosts(email, { page: currentPage, limit }),
      getPostsCount(email)
    ]);

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
        data: JSON.stringify(data || []),
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
      pathname: "/my-dreams",
      component: "MyDreams",
    });

    return {
      props: {
        serverSession: JSON.stringify(authProps.props.serverSession),
        data: JSON.stringify([]),
        pagination: JSON.stringify({ currentPage: 1, totalPages: 0, total: 0, hasNextPage: false, hasPrevPage: false, limit: 20 }),
        ...(await serverSideTranslations(context.locale, [
          "dashboard",
          "common",
        ])),
      },
    };
  }
}
