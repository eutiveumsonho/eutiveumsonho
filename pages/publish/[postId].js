import CreateOrEdit from "../../containers/create-or-edit";
import { getAuthProps } from "../../lib/auth";
import { getDreamById } from "../../lib/db/reads";
import Head from "next/head";
import { getUserAgentProps } from "../../lib/user-agent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

/**
 * The page for editing a dream. This page is only accessible for logged in users.
 * This page is used for creating dreams. Once the dream is synced to the cloud, it redirects
 * the user to another page that looks exactly the same as this, which is used for editing dreams.
 *
 * @param {{ data, serverSession }} props - The props this component gets from getServerSideProps
 */
export default function DreamEditor(props) {
  const { data, ...authProps } = props;
  const { t } = useTranslation("dashboard");

  return (
    <>
      <Head>
        <title>{t("edit-dream")}</title>
      </Head>
      <CreateOrEdit {...authProps} data={data ? JSON.parse(data) : null} />
    </>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);
  const { res } = context;

  if (!authProps.props.serverSession) {
    res.setHeader("location", `/${context.locale}/auth/signin`);
    res.statusCode = 302;
    res.end();
  }

  try {
    const { postId } = context.params;

    if (postId) {
      const data = await getDreamById(postId);

      return {
        props: {
          ...authProps.props,
          data: JSON.stringify(data),
          ...getUserAgentProps(context),
          ...(await serverSideTranslations(context.locale, [
            "dashboard",
            "editor",
            "common",
          ])),
        },
      };
    }

    return {
      props: {
        ...authProps.props,
        data: null,
        ...getUserAgentProps(context),
        ...(await serverSideTranslations(context.locale, [
          "dashboard",
          "editor",
          "common",
        ])),
      },
    };
  } catch (error) {
    console.error({
      error,
      service: "web",
      pathname: "/publish/[postId]",
      component: "DreamEditor",
    });
  }
}
