import { getAuthProps } from "../../lib/auth";

import Create from "../../containers/create";
import Head from "next/head";

export default function Home(props) {
  return (
    <>
      <Head>
        <title>Criar sonho</title>
      </Head>
      <Create {...props} />
    </>
  );
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);

  if (!authProps.props.serverSession) {
    const { res } = context;

    res.setHeader("location", "/auth/signin");
    res.statusCode = 302;
    res.end();
  }

  return authProps;
}
