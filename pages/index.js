import { getSession } from "next-auth/react";

import dynamic from "next/dynamic";
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
  const session = await getSession(context);

  if (!session) {
    return {
      props: { user: null },
    };
  }

  return {
    props: {
      user: session.user,
    },
  };
}
