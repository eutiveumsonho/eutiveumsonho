import { getAuthProps } from "../lib/auth";

import Dashboard from "../components/dashboard";

export default function FindOut(props) {
  const { serverSession } = props;

  return <Dashboard serverSession={serverSession} />;
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
