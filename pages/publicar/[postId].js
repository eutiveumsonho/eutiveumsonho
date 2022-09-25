import { getAuthProps } from "../../lib/auth";

import Create from "../../containers/create";
import { getDreamById } from "../../lib/db/reads";
import { logError } from "../../lib/o11y";
import Head from "next/head";

export default function DreamEditor(props) {
  const { data, ...authProps } = props;

  return (
    <>
      <Head>
        <title>Editar sonho</title>
      </Head>
      <Create {...authProps} data={data ? JSON.parse(data) : null} />
    </>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);
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
        props: { ...authProps.props, data: JSON.stringify(data) },
      };
    }

    return { props: { ...authProps.props, data: null } };
  } catch (error) {
    logError({
      ...error,
      service: "web",
      pathname: "/publicar/[postId]",
      component: "DreamEditor",
    });
  }
}
