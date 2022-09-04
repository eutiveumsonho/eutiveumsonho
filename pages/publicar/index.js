import { getAuthProps } from "../../lib/auth";

import Create from "../../components/pages/create";

export default function Home(props) {
  return <Create {...props} />;
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
