import { getAuthProps } from "../lib/auth";

import Invite from "../containers/invite";
import { logReq } from "../lib/middleware";

export default function Home() {
  return <Invite />;
}

export async function getServerSideProps(context) {
  const authProps = await getAuthProps(context);
  logReq(context.req, context.res);

  if (authProps.props.serverSession) {
    const { res } = context;
    res.setHeader("location", "/dreams");
    res.statusCode = 302;
    res.end();
  }

  return { props: {} };
}
