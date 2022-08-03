import { useAuth } from "../lib/auth";

import Create from "../components/pages/create";
import Invite from "../components/pages/invite";

export default function Home(props) {
  const { serverSession } = props;

  if (serverSession) {
    return <Create serverSession={serverSession} />;
  }

  return <Invite />;
}

export async function getServerSideProps(context) {
  return useAuth(context);
}
