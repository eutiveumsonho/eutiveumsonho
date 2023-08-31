import CreateOrEdit from "../../containers/create-or-edit";
import { getAuthProps } from "../../lib/auth";
import { getDreamById } from "../../lib/db/reads";
import { logError } from "../../lib/o11y";
import Head from "next/head";
import { logReq } from "../../lib/middleware";
import { getUserAgentProps } from "../../lib/user-agent";

export default function DreamEditor(props) {
  const { data, ...authProps } = props;

  return (
    <>
      <Head>
        <title>Editar sonho</title>
      </Head>
      <CreateOrEdit {...authProps} data={data ? JSON.parse(data) : null} />
    </>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);
  logReq(context.req, context.res);
  const { res } = context;

  if (!authProps.props.serverSession) {
    res.setHeader("location", "/auth/signin");
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
        },
      };
    }

    return {
      props: { ...authProps.props, data: null, ...getUserAgentProps(context) },
    };
  } catch (error) {
    logError({
      error,
      service: "web",
      pathname: "/publish/[postId]",
      component: "DreamEditor",
    });
  }
}
