import { getAuthProps } from "../lib/auth";

import Invite from "../components/pages/invite";

export default function Home() {
  return <Invite />;
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);

  if (authProps.props.serverSession) {
    const { res } = context;
    res.setHeader("location", "/meus-sonhos");
    res.statusCode = 302;
    res.end();
  }

  return { props: {} };
}
