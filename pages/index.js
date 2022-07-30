import useAuth from "../lib/useAuth";

import Create from "../components/pages/create";
import Invite from "../components/pages/invite";

export default function Home(props) {
  const { user } = props;

  if (user) {
    return <Create user={user} />;
  }

  return <Invite />;
}

export async function getServerSideProps(context) {
  return useAuth(context);
}
